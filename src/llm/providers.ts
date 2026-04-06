import { anthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { createOllama } from 'ollama-ai-provider-v2';
import { xai } from '@ai-sdk/xai';
import type { LanguageModel } from 'ai';
import { config } from '../config';
import type { LlmProviderDefinition, LlmProviderId } from './types';

export const llmProviders: LlmProviderDefinition[] = [
  {
    id: 'openai',
    displayName: 'OpenAI',
    defaultModel: 'gpt-4o',
    requiresApiKey: true,
    keyName: 'OpenAI API Key',
    keyLabel: 'Enter OpenAI API key:',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4.1', label: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    ],
  },
  {
    id: 'anthropic',
    displayName: 'Anthropic',
    defaultModel: 'claude-sonnet-4-20250514',
    requiresApiKey: true,
    keyName: 'Anthropic API Key',
    keyLabel: 'Enter Anthropic API key:',
    models: [
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { id: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
      { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet' },
    ],
  },
  {
    id: 'google',
    displayName: 'Google Gemini',
    defaultModel: 'gemini-2.5-flash',
    requiresApiKey: true,
    keyName: 'Google AI API Key',
    keyLabel: 'Enter Google AI API key:',
    models: [
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
    ],
  },
  {
    id: 'xai',
    displayName: 'xAI',
    defaultModel: 'grok-3',
    requiresApiKey: true,
    keyName: 'xAI API Key',
    keyLabel: 'Enter xAI API key:',
    models: [
      { id: 'grok-3', label: 'Grok 3' },
      { id: 'grok-4-latest', label: 'Grok 4 Latest' },
      { id: 'grok-4-fast-reasoning', label: 'Grok 4 Fast Reasoning' },
    ],
  },
  {
    id: 'mistral',
    displayName: 'Mistral',
    defaultModel: 'mistral-large-latest',
    requiresApiKey: true,
    keyName: 'Mistral API Key',
    keyLabel: 'Enter Mistral API key:',
    models: [
      { id: 'mistral-large-latest', label: 'Mistral Large Latest' },
      { id: 'mistral-medium-latest', label: 'Mistral Medium Latest' },
      { id: 'mistral-small-latest', label: 'Mistral Small Latest' },
    ],
  },
  {
    id: 'deepseek',
    displayName: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    requiresApiKey: true,
    keyName: 'DeepSeek API Key',
    keyLabel: 'Enter DeepSeek API key:',
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek Chat' },
      { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
    ],
  },
  {
    id: 'ollama',
    displayName: 'Ollama',
    defaultModel: 'llama3',
    requiresApiKey: false,
    requiresBaseUrl: true,
    models: [
      { id: 'llama3', label: 'Llama 3' },
      { id: 'qwen2.5', label: 'Qwen 2.5' },
      { id: 'mistral', label: 'Mistral' },
    ],
  },
];

const providerMap = new Map(llmProviders.map((provider) => [provider.id, provider]));

export const getProviderDefinition = (providerId: LlmProviderId): LlmProviderDefinition => {
  const provider = providerMap.get(providerId);

  if (!provider) {
    throw new Error(`Unsupported LLM provider: ${providerId}`);
  }

  return provider;
};

export const getConfiguredProvider = (): LlmProviderDefinition => {
  const providerId = config.get('llmProvider');
  return getProviderDefinition(providerId);
};

export const getConfiguredModel = (): string => {
  const provider = getConfiguredProvider();
  const configuredModel = config.get('llmModel');

  if (!configuredModel) {
    return provider.defaultModel;
  }

  const matchesProvider = provider.models.some((model) => model.id === configuredModel);
  return matchesProvider ? configuredModel : provider.defaultModel;
};

export const createConfiguredLlm = (): LanguageModel => {
  const provider = getConfiguredProvider();
  const modelId = getConfiguredModel();
  const apiKey = config.get('llmApiKey');

  if (provider.requiresApiKey && !apiKey) {
    throw new Error(`${provider.keyName || provider.displayName} not found.`);
  }

  if (provider.id === 'openai') {
    return createOpenAI({ apiKey })(modelId);
  }

  if (provider.id === 'anthropic') {
    return anthropic(modelId, { apiKey });
  }

  if (provider.id === 'google') {
    return google(modelId, { apiKey });
  }

  if (provider.id === 'xai') {
    return xai(modelId, { apiKey });
  }

  if (provider.id === 'mistral') {
    return mistral(modelId, { apiKey });
  }

  if (provider.id === 'deepseek') {
    const deepseek = createDeepSeek({ apiKey });
    return deepseek(modelId) as unknown as LanguageModel;
  }

  if (provider.id === 'ollama') {
    const ollama = createOllama({
      baseURL: config.get('ollamaUrl'),
    });
    return ollama(modelId) as unknown as LanguageModel;
  }

  throw new Error(`No LLM factory registered for provider: ${provider.id}`);
};
