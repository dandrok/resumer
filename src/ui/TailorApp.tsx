import { useEffect, useState } from 'react';
import { Box, Spacer, Text, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import { ScreenShell } from './ScreenShell';
import { useTailorFlow } from './useTailorFlow';

type Props = {
  resumePath: string;
  jobUrl: string;
}

const REVIEW_LINES_PER_PAGE = 26;

export const TailorApp: React.FC<Props> = ({ resumePath, jobUrl }) => {
  const { exit } = useApp();
  const {
    analysis,
    approveMarkdown,
    error,
    generatedMarkdown,
    interviewQuestions,
    phase,
    requestRevision,
    setInterviewAnswers,
    startGeneration,
  } = useTailorFlow(resumePath, jobUrl, exit);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [reviewMode, setReviewMode] = useState<'actions' | 'revision'>('actions');
  const [reviewPage, setReviewPage] = useState(0);
  const [revisionNote, setRevisionNote] = useState('');

  useEffect(() => {
    if (phase === 'interviewing') {
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
    }

    if (phase === 'reviewing') {
      setReviewMode('actions');
      setReviewPage(0);
      setRevisionNote('');
    }
  }, [phase]);

  const handleAnswerSubmit = (value: string) => {
    const question = interviewQuestions[currentQuestionIndex];

    if (!question) {
      return;
    }

    setInterviewAnswers((prev) => ({
      ...prev,
      [question.id]: value.trim(),
    }));
    setCurrentAnswer('');

    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    startGeneration();
  };

  const reviewLines = generatedMarkdown.split('\n');
  const totalReviewPages = Math.max(1, Math.ceil(reviewLines.length / REVIEW_LINES_PER_PAGE));
  const currentReviewPage = Math.min(reviewPage, totalReviewPages - 1);
  const pageStart = currentReviewPage * REVIEW_LINES_PER_PAGE;
  const pageEnd = pageStart + REVIEW_LINES_PER_PAGE;
  const previewLines = reviewLines.slice(pageStart, pageEnd);

  const handleReviewAction = (item: { value: 'previous' | 'next' | 'approve' | 'revise' | 'cancel' }) => {
    if (item.value === 'previous') {
      setReviewPage((prev) => Math.max(0, prev - 1));
      return;
    }

    if (item.value === 'next') {
      setReviewPage((prev) => Math.min(totalReviewPages - 1, prev + 1));
      return;
    }

    if (item.value === 'approve') {
      approveMarkdown();
      return;
    }

    if (item.value === 'revise') {
      setReviewMode('revision');
      return;
    }

    exit();
  };

  const currentQuestion = interviewQuestions[currentQuestionIndex];

  return (
    <ScreenShell
      title="Tailoring Session"
      subtitle="Extract, analyze, enrich, review, and export a one-page tailored resume."
      titleColor="blue"
    >
      <Spacer />

      {phase === 'extracting' && (
        <Box>
          <Text><Spinner type="dots" /> Extracting resume text and scraping job offer...</Text>
        </Box>
      )}

      {phase === 'analyzing' && (
        <Box flexDirection="column">
          <Text><Spinner type="dots" /> Ranking recent roles and spotting weak areas...</Text>
          <Text color="gray">The next step will ask about impact, ownership, and missing skills.</Text>
        </Box>
      )}

      {phase === 'interviewing' && currentQuestion && (
        <Box flexDirection="column">
          <Text color="yellow">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</Text>
          <Text bold>{currentQuestion.title}</Text>
          <Text>{currentQuestion.prompt}</Text>
          <Text italic color="gray">{currentQuestion.helpText}</Text>
          {analysis && analysis.preservationNotes.length > 0 && (
            <Box marginTop={1} flexDirection="column">
              <Text color="cyan">Preservation focus:</Text>
              {analysis.preservationNotes.map((note) => (
                <Text key={note} color="gray">- {note}</Text>
              ))}
            </Box>
          )}
          <Box marginTop={1}>
            <Text>Answer: </Text>
            <TextInput value={currentAnswer} onChange={setCurrentAnswer} onSubmit={handleAnswerSubmit} />
          </Box>
        </Box>
      )}

      {phase === 'generating' && (
        <Box flexDirection="column">
          <Text><Spinner type="dots" /> Generating tailored Markdown draft...</Text>
          <Text color="gray">This draft will be reviewed before PDF export.</Text>
        </Box>
      )}

      {phase === 'reviewing' && (
        <Box flexDirection="column">
          <Text color="green" bold>Draft ready for review</Text>
          <Text color="gray">
            Reviewing Markdown page {currentReviewPage + 1} of {totalReviewPages} before export.
          </Text>
          <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor="gray" padding={1}>
            {previewLines.map((line, index) => (
              <Text key={`${index}-${line}`}>{line || ' '}</Text>
            ))}
          </Box>

          {reviewMode === 'actions' && (
            <Box marginTop={1} flexDirection="column">
              <Text color="cyan">Choose what to do with this draft:</Text>
              <SelectInput
                items={[
                  ...(currentReviewPage > 0 ? [{ label: 'Previous page', value: 'previous' as const }] : []),
                  ...(currentReviewPage < totalReviewPages - 1 ? [{ label: 'Next page', value: 'next' as const }] : []),
                  { label: 'Approve and export PDF', value: 'approve' as const },
                  { label: 'Revise draft with feedback', value: 'revise' as const },
                  { label: 'Cancel tailoring session', value: 'cancel' as const },
                ]}
                onSelect={handleReviewAction}
              />
            </Box>
          )}

          {reviewMode === 'revision' && (
            <Box marginTop={1} flexDirection="column">
              <Text>What should change in the next draft?</Text>
              <Text color="gray">Example: keep more backend ownership detail, make impact clearer, trim the summary.</Text>
              <TextInput
                value={revisionNote}
                onChange={setRevisionNote}
                onSubmit={(value) => requestRevision(value)}
              />
            </Box>
          )}
        </Box>
      )}

      {phase === 'exporting' && (
        <Box>
          <Text><Spinner type="dots" /> Exporting reviewed Markdown to PDF...</Text>
        </Box>
      )}

      {phase === 'done' && (
        <Box>
          <Text color="green" bold>Success! Tailored resume saved as: {resumePath.replace('.pdf', '_tailored.pdf')}</Text>
        </Box>
      )}

      {phase === 'error' && (
        <Box flexDirection="column">
          <Text color="red" bold>Error:</Text>
          <Text color="red">{error}</Text>
        </Box>
      )}
    </ScreenShell>
  );
};
