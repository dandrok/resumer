import { formatAnalysis } from './helpers';
import type { AnalysisResult } from './types';

export const buildAnalysisPrompt = (cvText: string, jobText: string): string => `
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
`;

export const buildGenerationPrompt = ({
  analysis,
  cvText,
  interviewAnswers,
  jobText,
  previousMarkdown,
  revisionRequest,
}: {
  analysis: AnalysisResult | null;
  cvText: string;
  interviewAnswers: string;
  jobText: string;
  previousMarkdown: string;
  revisionRequest: string | null;
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
