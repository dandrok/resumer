import { useState, useEffect } from 'react';
import { parsePdf } from '../utils/pdf';
import { scrapeJobDescription } from '../utils/scraper';
import { getLlm } from '../utils/llm';
import { generateText } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import { mdToPdf } from 'md-to-pdf';

import { resumeCss } from '../assets/resumeCss';

export type Phase = 'extracting' | 'analyzing' | 'interviewing' | 'generating' | 'done' | 'error';

export interface MissingSkill {
  skill: string;
  reason: string;
}

export const useTailorFlow = (resumePath: string, jobUrl: string, exit: () => void) => {
  const [phase, setPhase] = useState<Phase>('extracting');
  const [error, setError] = useState<string | null>(null);
  const [cvText, setCvText] = useState('');
  const [jobText, setJobText] = useState('');
  const [missingSkills, setMissingSkills] = useState<MissingSkill[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // 1. Extraction Phase
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

  // 2. Analysis Phase
  useEffect(() => {
    if (phase === 'analyzing') {
      const runAnalysis = async () => {
        try {
          const model = getLlm();
          const { text } = await generateText({
            model,
            prompt: `
              You are an expert career advisor. Analyze the following Resume and Job Description.
              Identify key requirements from the Job Description that are MISSING or weakly represented in the Resume.
              Be strict. Do not invent any experience.
              
              Resume:
              ${cvText}
              
              Job Description:
              ${jobText}
              
              Return a JSON array of objects with "skill" and "reason" fields.
              Return ONLY the JSON.
            `,
          });

          const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const MissingSkillsSchema = z.array(z.object({ skill: z.string(), reason: z.string() }));
          const parsed = MissingSkillsSchema.parse(JSON.parse(jsonText));

          if (parsed.length > 0) {
            setMissingSkills(parsed);
            setPhase('interviewing');
          } else {
            setPhase('generating');
          }
        } catch (err: any) {
          fs.appendFileSync('resumer-error.log', `[analyzing] ${err.stack || err}\n`);
          setError(`[Analysis] ${err.message || String(err)}`);
          setPhase('error');
        }
      };
      runAnalysis();
    }
  }, [phase, cvText, jobText]);

  // 3. Generation Phase
  useEffect(() => {
    if (phase === 'generating') {
      const runGeneration = async () => {
        try {
          const model = getLlm();
          const answersStr = Object.entries(userAnswers).map(([s, a]) => `- ${s}: ${a}`).join('\n');
          const prompt = `
            You are a professional resume writer. Rewrite the provided Resume to better match the Job Description.

            Rules:
            1. Use Markdown format.
            2. Focus on keywords from the Job Description.
            3. Incorporate the user's answers below to bridge missing gaps.
            4. HIGHLIGHT MATCHES: Use bolding (**keyword**) for the most important technologies, skills, and requirements mentioned in the Job Description when they appear in your rewritten text. This helps recruiters scan the CV faster.
            5. DO NOT invent any facts or experience not found in the original Resume or the User Answers.
            6. Use the following strict semantic structure:
               - H1 (# Name)
               - Paragraph under H1 for contact info (Email | LinkedIn | GitHub | Phone Number). It MUST be centered.
               - H2 (## SECTION NAME) for sections: SUMMARY, EXPERIENCE, SKILLS. Do NOT include an Education section.
               - H3 (### Job Title) with dates and location on the right using bolding (e.g., ### Senior Engineer **2020 - Present**)
               - H4 (#### Company Name)
               - Unordered lists (-) for experience bullets. Focus on impact and tech stack.
               - SKILLS CATEGORIZATION: The Skills section MUST be broken down into the following specific categories (use triple asterisks for labels):
                 - ***Languages & Core Tech:***
                 - ***Frontend Ecosystem:***
                 - ***Architecture & Best Practices:***
                 - ***Dev Env & AI Tooling:***
                 - ***Testing & CI/CD:***
                 - ***Working Knowledge:***
                 - ***Spoken Languages:***
               - Each category should be a single paragraph or list item, NOT a full list, to save space.
            
            Original Resume:
            ${cvText}

            Job Description:
            ${jobText}

            User Answers about missing skills:
            ${answersStr}

            Output ONLY the Markdown.
          `;
          const { text: markdown } = await generateText({ model, prompt });

          const pdfResult = await mdToPdf({ content: markdown }, {
            css: resumeCss,
            body_class: [], // Clear default classes
            pdf_options: { format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } } // Handled by @page
          });
          fs.writeFileSync(resumePath.replace('.pdf', '_tailored.pdf'), pdfResult.content);
          setPhase('done');
          setTimeout(() => exit(), 2000);
        } catch (err: any) {
          fs.appendFileSync('resumer-error.log', `[generating] ${err.stack || err}\n`);
          setError(`[Generation] ${err.message || String(err)}`);
          setPhase('error');
        }
      };
      runGeneration();
    }
  }, [phase, cvText, jobText, userAnswers, resumePath, exit]);

  return { phase, error, missingSkills, setPhase, setUserAnswers };
};
