import { useEffect, useState } from 'react';
import fs from 'fs';
import { generateText } from 'ai';
import { mdToPdf } from 'md-to-pdf';
import { resumeStyles } from '../assets/resumeStyles';
import { getLlm } from '../llm';
import { AnalysisSchema, buildInterviewQuestions, formatInterviewAnswers, parseJsonResponse } from '../tailoring/helpers';
import { buildAnalysisPrompt, buildGenerationPrompt } from '../tailoring/prompts';
import type { AnalysisResult, InterviewQuestion, Phase } from '../tailoring/types';
import { parsePdf } from '../utils/pdf';
import { scrapeJobDescription } from '../utils/scraper';

export const useTailorFlow = (resumePath: string, jobUrl: string, exit: () => void) => {
  const [phase, setPhase] = useState<Phase>('extracting');
  const [error, setError] = useState<string | null>(null);
  const [cvText, setCvText] = useState('');
  const [jobText, setJobText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({});
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [revisionRequest, setRevisionRequest] = useState<string | null>(null);

  const failPhase = (currentPhase: string, err: any, label: string) => {
    fs.appendFileSync('resumer-error.log', `[${currentPhase}] ${err.stack || err}\n`);
    setError(`[${label}] ${err.message || String(err)}`);
    setPhase('error');
  };

  const runExtraction = async () => {
    try {
      const cv = await parsePdf(resumePath);
      const job = await scrapeJobDescription(jobUrl);
      setCvText(cv);
      setJobText(job);
      setPhase('analyzing');
    } catch (err: any) {
      failPhase('extracting', err, 'Extraction');
    }
  };

  const runAnalysis = async () => {
    try {
      const model = getLlm();
      const { text } = await generateText({
        model,
        prompt: buildAnalysisPrompt(cvText, jobText),
      });

      const parsed = parseJsonResponse(text, AnalysisSchema);
      const nextAnalysis: AnalysisResult = {
        prioritizedRoles: parsed.prioritizedRoles,
        missingSkills: parsed.missingSkills,
        preservationNotes: parsed.preservationNotes,
      };

      const questions = buildInterviewQuestions(nextAnalysis);
      setAnalysis(nextAnalysis);
      setInterviewQuestions(questions);
      setPhase(questions.length > 0 ? 'interviewing' : 'generating');
    } catch (err: any) {
      failPhase('analyzing', err, 'Analysis');
    }
  };

  const runGeneration = async () => {
    try {
      const model = getLlm();
      const answers = formatInterviewAnswers(interviewQuestions, interviewAnswers);
      const prompt = buildGenerationPrompt({
        cvText,
        jobText,
        analysis,
        interviewAnswers: answers,
        revisionRequest,
        previousMarkdown: generatedMarkdown,
      });
      const { text } = await generateText({ model, prompt });

      setGeneratedMarkdown(text.trim());
      setRevisionRequest(null);
      setPhase('reviewing');
    } catch (err: any) {
      failPhase('generating', err, 'Generation');
    }
  };

  const runExport = async () => {
    try {
      const pdfResult = await mdToPdf(
        { content: generatedMarkdown },
          {
            css: resumeStyles,
          body_class: [],
          pdf_options: {
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' },
          },
        },
      );

      if (!pdfResult.content) {
        throw new Error('PDF export returned no content.');
      }

      fs.writeFileSync(resumePath.replace('.pdf', '_tailored.pdf'), pdfResult.content);
      setPhase('done');
      setTimeout(() => exit(), 2000);
    } catch (err: any) {
      failPhase('exporting', err, 'Export');
    }
  };

  useEffect(() => {
    runExtraction();
  }, [resumePath, jobUrl]);

  useEffect(() => {
    if (phase !== 'analyzing') {
      return;
    }

    runAnalysis();
  }, [phase, cvText, jobText]);

  useEffect(() => {
    if (phase !== 'generating') {
      return;
    }

    runGeneration();
  }, [phase, cvText, jobText, analysis, interviewAnswers, interviewQuestions, revisionRequest]);

  useEffect(() => {
    if (phase !== 'exporting') {
      return;
    }

    runExport();
  }, [phase, generatedMarkdown, resumePath, exit]);

  const startGeneration = () => {
    setPhase('generating');
  };

  const requestRevision = (feedback: string) => {
    setRevisionRequest(feedback.trim() || 'Improve the draft while preserving the current structure.');
    setPhase('generating');
  };

  const approveMarkdown = () => {
    setPhase('exporting');
  };

  return {
    analysis,
    approveMarkdown,
    error,
    generatedMarkdown,
    interviewAnswers,
    interviewQuestions,
    phase,
    requestRevision,
    setInterviewAnswers,
    startGeneration,
  };
};
