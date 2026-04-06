import { FC, useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { config } from '../config';
import { getProviderDefinition, llmProviders } from '../llm/providers';
import type { LlmProviderId } from '../llm/types';
import { ScreenShell } from './ScreenShell';

type SettingsStep = 'menu' | 'llm-provider' | 'llm-model' | 'llm-key' | 'ollama-url' | 'jina-key' | 'done';

type InitAppProps = {
  onCancel: VoidFunction;
};

export const InitApp: FC<InitAppProps> = ({ onCancel }) => {
  const [step, setStep] = useState<SettingsStep>('menu');
  const [llmKey, setLlmKey] = useState(config.get('llmApiKey') || '');
  const [jinaKey, setJinaKey] = useState(config.get('jinaApiKey') || '');
  const [selectedProvider, setSelectedProvider] = useState<LlmProviderId>(config.get('llmProvider'));
  const [ollamaUrl, setOllamaUrl] = useState(config.get('ollamaUrl') || 'http://localhost:11434');
  const providerDefinition = getProviderDefinition(selectedProvider);

  const handleMenuSelect = (item: { value: string }) => {
    if (item.value === 'llm') setStep('llm-provider');
    if (item.value === 'scraper') setStep('jina-key');
    if (item.value === 'back') onCancel();
  };

  const handleProviderSelect = (item: { value: string }) => {
    const nextProvider = item.value as LlmProviderId;
    const nextDefinition = getProviderDefinition(nextProvider);

    setSelectedProvider(nextProvider);
    config.set('llmProvider', nextProvider);
    config.set('llmModel', nextDefinition.defaultModel);
    setStep('llm-model');
  };

  const handleLlmModelSelect = (item: { value: string }) => {
    config.set('llmModel', item.value);

    if (providerDefinition.requiresBaseUrl) {
      setStep('ollama-url');
      return;
    }

    if (providerDefinition.requiresApiKey) {
      setStep('llm-key');
      return;
    }

    setStep('done');
  };

  const handleLlmSubmit = (value: string) => {
    config.set('llmApiKey', value);
    setStep('done');
  };

  const handleJinaSubmit = (value: string) => {
    config.set('jinaApiKey', value);
    setStep('done');
  };

  const handleOllamaSubmit = (value: string) => {
    config.set('ollamaUrl', value);
    setStep('done');
  };

  useEffect(() => {
    if (step === 'done') {
      const timer = setTimeout(() => setStep('menu'), 1000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <ScreenShell title="Settings" subtitle="Configure the LLM provider and optional Jina Reader access.">
      {step === 'menu' && (
        <SelectInput
          items={[
            { label: 'Configure LLM Provider', value: 'llm' },
            { label: 'Configure Scraper Key', value: 'scraper' },
            { label: 'Back to Main Menu', value: 'back' },
          ]}
          onSelect={handleMenuSelect}
        />
      )}

      {step === 'llm-provider' && (
        <Box flexDirection="column">
          <Text>Select LLM provider:</Text>
          <SelectInput
            items={llmProviders.map((provider) => ({
              label: `${provider.displayName} (${provider.models[0]?.label || provider.defaultModel})`,
              value: provider.id,
            }))}
            onSelect={handleProviderSelect}
          />
        </Box>
      )}

      {step === 'llm-model' && (
        <Box flexDirection="column">
          <Text>Select {providerDefinition.displayName} model:</Text>
          <SelectInput
            items={providerDefinition.models.map((model) => ({
              label: model.label,
              value: model.id,
            }))}
            onSelect={handleLlmModelSelect}
          />
        </Box>
      )}

      {step === 'llm-key' && (
        <Box flexDirection="column">
          <Text>{providerDefinition.keyLabel || 'Enter LLM API key:'}</Text>
          <TextInput value={llmKey} onChange={setLlmKey} onSubmit={handleLlmSubmit} mask="*" />
        </Box>
      )}

      {step === 'ollama-url' && (
        <Box flexDirection="column">
          <Text>Enter Ollama base URL:</Text>
          <TextInput value={ollamaUrl} onChange={setOllamaUrl} onSubmit={handleOllamaSubmit} />
        </Box>
      )}

      {step === 'jina-key' && (
        <Box flexDirection="column">
          <Text>Enter Jina Reader API key:</Text>
          <TextInput value={jinaKey} onChange={setJinaKey} onSubmit={handleJinaSubmit} mask="*" />
        </Box>
      )}

      {step === 'done' && (
        <Text color="green">Configuration updated.</Text>
      )}
    </ScreenShell>
  );
};
