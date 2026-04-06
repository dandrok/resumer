import Conf, { Schema } from 'conf';
import type { LlmProviderId } from '../llm/types';

export type Config = {
  llmApiKey?: string;
  jinaApiKey?: string;
  llmModel: string;
  llmProvider: LlmProviderId;
  ollamaUrl?: string;
};

const schema: Schema<Config> = {
  llmApiKey: { type: 'string' },
  jinaApiKey: { type: 'string' },
  llmModel: { type: 'string', default: 'gpt-4o' },
  llmProvider: {
    type: 'string',
    default: 'openai',
    enum: ['anthropic', 'deepseek', 'google', 'mistral', 'ollama', 'openai', 'xai'],
  },
  ollamaUrl: { type: 'string', default: 'http://localhost:11434' },
};

export const config = new Conf<Config>({
  projectName: 'resumer',
  schema
});
