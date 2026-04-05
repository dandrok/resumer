import { useEffect, useState } from 'react';
import fs from 'fs';
import { generateText } from 'ai';
import { mdToPdf } from 'md-to-pdf';
import { z } from 'zod';
import { resumeCss } from '../assets/resumeCss';
import { getLlm } from '../utils/llm';
import { parsePdf } from '../utils/pdf';
import { scrapeJobDescription } from '../utils/scraper';

export type Phase =
  | 'extracting'
  | 'analyzing'
  | 'interviewing'
  | 'generating'
  | 'reviewing'
  | 'exporting'
  | 'done'
  | 'error';

export interface MissingSkill {
  skill: string;
  reason: string;
}

export interface PrioritizedRole {
  role: string;
  reason: string;
  technologies: string[];
}

export interface InterviewQuestion {
  id: string;
  category: 'role' | 'skill';
  title: string;
  prompt: string;
  helpText: string;
}

interface AnalysisResult {
  prioritizedRoles: PrioritizedRole[];
  missingSkills: MissingSkill[];
  preservationNotes: string[];
}

const AnalysisSchema = z.object({
  prioritizedRoles: z.array(
    z.object({
      role: z.string(),
      reason: z.string(),
      technologies: z.array(z.string()).default([]),
    }),
  ).max(2),
  missingSkills: z.array(
    z.object({
      skill: z.string(),
      reason: z.string(),
    }),
  ).max(3),
  preservationNotes: z.array(z.string()).max(4).default([]),
});

const parseJsonResponse = <T,>(text: string, schema: z.ZodType<T>): T => {
  const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return schema.parse(JSON.parse(jsonText));
};

const buildInterviewQuestions = (analysis: AnalysisResult): InterviewQuestion[] => {
  const roleQuestions = analysis.prioritizedRoles.flatMap((role, index) => [
    {
      id: `role-${index}-scope`,
      category: 'role' as const,
      title: role.role,
      prompt: 'What system, product, or problem area did you work on in this role?',
      helpText: role.reason,
    },
    {
      id: `role-${index}-ownership`,
      category: 'role' as const,
      title: role.role,
      prompt: 'What was your ownership or main responsibility in this role?',
      helpText: `Relevant technologies: ${role.technologies.join(', ') || 'not detected'}`,
    },
    {
      id: `role-${index}-impact`,
      category: 'role' as const,
      title: role.role,
      prompt: 'What changed because of your work? Mention impact you can defend without inventing numbers.',
      helpText: 'Qualitative outcomes are fine: reliability, delivery speed, migration progress, reduced manual work, or scale handled.',
    },
  ]);

  const skillQuestions = analysis.missingSkills.map((item, index) => ({
    id: `skill-${index}`,
    category: 'skill' as const,
    title: item.skill,
    prompt: 'Do you have relevant experience with this? Add only facts you want the CV to mention.',
    helpText: item.reason,
  }));

  return [...roleQuestions, ...skillQuestions];
};

const formatInterviewAnswers = (
  questions: InterviewQuestion[],
  answers: Record<string, string>,
): string => questions
  .map((question) => {
    const answer = answers[question.id]?.trim() || 'No additional detail provided.';
    return `- [${question.category.toUpperCase()}] ${question.title} | ${question.prompt}\n  ${answer}`;
  })
  .join('\n');

const formatAnalysis = (analysis: AnalysisResult | null): string => {
  if (!analysis) {
    return 'No analysis available.';
  }

  const roleSummary = analysis.prioritizedRoles
    .map((role, index) => `${index + 1}. ${role.role} - ${role.reason}`)
    .join('\n');
  const skillSummary = analysis.missingSkills
    .map((item) => `- ${item.skill}: ${item.reason}`)
    .join('\n');
  const preservationSummary = analysis.preservationNotes
    .map((note) => `- ${note}`)
    .join('\n');

  return [
    roleSummary ? `Prioritized recent roles:\n${roleSummary}` : 'Prioritized recent roles:\n- None identified',
    skillSummary ? `Weak or missing skills:\n${skillSummary}` : 'Weak or missing skills:\n- None identified',
    preservationSummary ? `Preservation notes:\n${preservationSummary}` : 'Preservation notes:\n- Preserve supporting experience in compressed form.',
  ].join('\n\n');
};

const buildGenerationPrompt = ({
  cvText,
  jobText,
  analysis,
  interviewAnswers,
  revisionRequest,
  previousMarkdown,
}: {
  cvText: string;
  jobText: string;
  analysis: AnalysisResult | null;
  interviewAnswers: string;
  revisionRequest: string | null;
  previousMarkdown: string;
}): string => `
You are a senior resume editor for software engineers.

Rewrite the provided resume into a one-page Markdown CV tailored to the job description.

Hard requirements:
1. Output Markdown only.
2. Keep the resume to one page when rendered to PDF.
3. Omit Education.
4. Preserve the user's strongest recent experience. Compress lower-priority material before deleting it.
5. Recency wins when deciding what deserves space, but the strongest evidence inside recent roles should appear first.
6. Every retained experience bullet should try to show:
   - action taken
   - impact or outcome
   - relevant technology or engineering context
7. Highlight the most important matching skills and experiences with bold text, but do not turn the document into a keyword list.
8. Do not invent facts, metrics, ownership, or technologies.
9. If the user left a skill question blank, do not add that skill as experience.
10. Keep the writing concrete and reviewer-friendly for future software-engineering interviews.

Formatting requirements:
- H1 for the candidate name
- one centered contact line under the title
- H2 sections for SUMMARY, EXPERIENCE, and SKILLS
- H3 for each role title, with dates/location inline in bold when available
- H4 for company name
- unordered lists for experience bullets
- SKILLS should contain 3-5 concise categories, including Spoken Languages

Resume source:
${cvText}

Job description:
${jobText}

Analysis:
${formatAnalysis(analysis)}

User-confirmed interview answers:
${interviewAnswers}

${previousMarkdown
  ? `Previous draft to improve:
${previousMarkdown}`
  : ''}

${revisionRequest
  ? `Revision request from the user:
${revisionRequest}`
  : ''}
`;

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

  useEffect(() => {
    const runExtraction = async () => {
      try {
        const cv = await parsePdf(resumePath);
        const job = await scrapeJobDescription(jobUrl);
        setCvText(cv);
        setJobText(job);
        setPhase('analyzing');
      } catch (err: any) {
        fs.appendFileSync('resumer-error.log', `[extracting] ${err.stack || err}\n`);
        setError(`[Extraction] ${err.message || String(err)}`);
        setPhase('error');
      }
    };

    runExtraction();
  }, [resumePath, jobUrl]);

  useEffect(() => {
    if (phase !== 'analyzing') {
      return;
    }

    const runAnalysis = async () => {
      try {
        const model = getLlm();
        const { text } = await generateText({
          model,
          prompt: `
You are an expert resume strategist for software engineers.

Analyze the resume and job description.

Return JSON only with this shape:
{
  "prioritizedRoles": [
    {
      "role": "Recent role label from the resume",
      "reason": "Why this recent role should be emphasized for this job",
      "technologies": ["Tech 1", "Tech 2"]
    }
  ],
  "missingSkills": [
    {
      "skill": "Skill name",
      "reason": "Why it matters and why it looks weak or absent"
    }
  ],
  "preservationNotes": [
    "Short note about what should be preserved or compressed"
  ]
}

Rules:
- Choose at most 2 prioritized roles.
- Choose at most 3 missing skills.
- Prefer recent roles.
- Preservation notes should help keep supporting experience instead of over-trimming.

Resume:
${cvText}

Job description:
${jobText}
          `,
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
        fs.appendFileSync('resumer-error.log', `[analyzing] ${err.stack || err}\n`);
        setError(`[Analysis] ${err.message || String(err)}`);
        setPhase('error');
      }
    };

    runAnalysis();
  }, [phase, cvText, jobText]);

  useEffect(() => {
    if (phase !== 'generating') {
      return;
    }

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
        fs.appendFileSync('resumer-error.log', `[generating] ${err.stack || err}\n`);
        setError(`[Generation] ${err.message || String(err)}`);
        setPhase('error');
      }
    };

    runGeneration();
  }, [phase, cvText, jobText, analysis, interviewAnswers, interviewQuestions, revisionRequest]);

  useEffect(() => {
    if (phase !== 'exporting') {
      return;
    }

    const runExport = async () => {
      try {
        const pdfResult = await mdToPdf(
          { content: generatedMarkdown },
          {
            css: resumeCss,
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
        fs.appendFileSync('resumer-error.log', `[exporting] ${err.stack || err}\n`);
        setError(`[Export] ${err.message || String(err)}`);
        setPhase('error');
      }
    };

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
