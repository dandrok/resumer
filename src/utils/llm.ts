import { createOpenAI } from '@ai-sdk/openai';
import { createOllama } from 'ollama-ai-provider';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { LanguageModel } from 'ai';
import { config } from '../config';

export const getLlm = (): LanguageModel => {
  const preferredModel = config.get('preferredModel');

  if (preferredModel === 'openai') {
    const apiKey = config.get('llmApiKey');
    if (!apiKey) throw new Error('OpenAI API Key not found.');
    return createOpenAI({ apiKey })('gpt-4o');
  }

  if (preferredModel === 'deepseek') {
    const apiKey = config.get('llmApiKey');
    if (!apiKey) throw new Error('DeepSeek API Key not found.');

    const deepseek = createDeepSeek({
      apiKey
    });
    return deepseek('deepseek-chat') as unknown as LanguageModel;
  }

  if (preferredModel === 'ollama') {
    const ollama = createOllama({
      baseURL: config.get('ollamaUrl'),
    });
    return ollama('llama3') as unknown as LanguageModel;
  }

  throw new Error('No valid LLM provider configured');
};
