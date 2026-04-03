import { useState } from 'react';
import { Box, Text, useApp, Spacer } from 'ink';
import SpinnerImport from 'ink-spinner';
import TextInputImport from 'ink-text-input';
import { useTailorFlow } from './useTailorFlow';

const Spinner = (SpinnerImport as any).default || SpinnerImport;
const TextInput = (TextInputImport as any).default || TextInputImport;

type Props = {
  resumePath: string;
  jobUrl: string;
}

export const TailorApp: React.FC<Props> = ({ resumePath, jobUrl }) => {
  const { exit } = useApp();
  const { phase, error, missingSkills, setPhase, setUserAnswers } = useTailorFlow(resumePath, jobUrl, exit);

  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleAnswerSubmit = (value: string) => {
    const currentSkill = missingSkills[currentSkillIndex]!.skill;
    setUserAnswers(prev => ({ ...prev, [currentSkill]: value }));
    setCurrentAnswer('');

    if (currentSkillIndex < missingSkills.length - 1) {
      setCurrentSkillIndex(prev => prev + 1);
    } else {
      setPhase('generating');
    }
  };

  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="blue">
      <Text bold color="blue">RESUMER - Tailoring Session</Text>
      <Spacer />

      {phase === 'extracting' && (
        <Box><Text><Spinner type="dots" /> Extracting resume text and scraping job offer...</Text></Box>
      )}

      {phase === 'analyzing' && (
        <Box><Text><Spinner type="dots" /> Analyzing gap between CV and Job Description...</Text></Box>
      )}

      {phase === 'interviewing' && missingSkills[currentSkillIndex] && (
        <Box flexDirection="column">
          <Text color="yellow">Question {currentSkillIndex + 1} of {missingSkills.length}:</Text>
          <Text bold>{missingSkills[currentSkillIndex]!.skill}</Text>
          <Text italic color="gray">{missingSkills[currentSkillIndex]!.reason}</Text>
          <Box marginTop={1}>
            <Text>Do you have experience with this? (Leave empty if no): </Text>
            <TextInput value={currentAnswer} onChange={setCurrentAnswer} onSubmit={handleAnswerSubmit} />
          </Box>
        </Box>
      )}

      {phase === 'generating' && (
        <Box><Text><Spinner type="dots" /> Generating your tailored resume PDF...</Text></Box>
      )}

      {phase === 'done' && (
        <Box><Text color="green" bold>✓ Success! Tailored resume saved as: {resumePath.replace('.pdf', '_tailored.pdf')}</Text></Box>
      )}

      {phase === 'error' && (
        <Box flexDirection="column">
          <Text color="red" bold>Error:</Text>
          <Text color="red">{error}</Text>
        </Box>
      )}
    </Box>
  );
};
