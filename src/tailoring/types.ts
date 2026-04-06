export type Phase =
  | 'extracting'
  | 'analyzing'
  | 'interviewing'
  | 'generating'
  | 'reviewing'
  | 'exporting'
  | 'done'
  | 'error';

export type MissingSkill = {
  skill: string;
  reason: string;
};

export type PrioritizedRole = {
  role: string;
  reason: string;
  technologies: string[];
};

export type InterviewQuestion = {
  id: string;
  category: 'role' | 'skill';
  title: string;
  prompt: string;
  helpText: string;
};

export type AnalysisResult = {
  prioritizedRoles: PrioritizedRole[];
  missingSkills: MissingSkill[];
  preservationNotes: string[];
};
