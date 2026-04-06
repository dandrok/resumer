import Conf, { Schema } from 'conf';

export type Config = {
  llmApiKey?: string;
  jinaApiKey?: string;
  ollamaUrl?: string;
  preferredModel: 'openai' | 'ollama' | 'deepseek';
};

const schema: Schema<Config> = {
  llmApiKey: { type: 'string' },
  jinaApiKey: { type: 'string' },
  ollamaUrl: { type: 'string', default: 'http://localhost:11434' },
  preferredModel: { type: 'string', default: 'openai', enum: ['openai', 'ollama', 'deepseek'] }
};

export const config = new Conf<Config>({
  projectName: 'resumer',
  schema
});
