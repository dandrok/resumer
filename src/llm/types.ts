export type LlmProviderId =
  | 'anthropic'
  | 'deepseek'
  | 'google'
  | 'mistral'
  | 'ollama'
  | 'openai'
  | 'xai';

export type LlmModelOption = {
  id: string;
  label: string;
};

export type LlmProviderDefinition = {
  id: LlmProviderId;
  defaultModel: string;
  displayName: string;
  keyLabel?: string;
  keyName?: string;
  models: LlmModelOption[];
  requiresApiKey: boolean;
  requiresBaseUrl?: boolean;
};
