import { z } from 'zod';
import type { AnalysisResult, InterviewQuestion } from './types';

export const AnalysisSchema = z.object({
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

export const parseJsonResponse = <T,>(text: string, schema: z.ZodType<T>): T => {
  const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return schema.parse(JSON.parse(jsonText));
};

export const buildInterviewQuestions = (analysis: AnalysisResult): InterviewQuestion[] => {
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

export const formatInterviewAnswers = (
  questions: InterviewQuestion[],
  answers: Record<string, string>,
): string => questions
  .map((question) => {
    const answer = answers[question.id]?.trim() || 'No additional detail provided.';
    return `- [${question.category.toUpperCase()}] ${question.title} | ${question.prompt}\n  ${answer}`;
  })
  .join('\n');

export const formatAnalysis = (analysis: AnalysisResult | null): string => {
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
