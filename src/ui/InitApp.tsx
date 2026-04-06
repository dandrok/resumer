import { FC, useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { config } from '../config';
import { ScreenShell } from './ScreenShell';

type SettingsStep = 'menu' | 'llm-provider' | 'llm-key' | 'ollama-url' | 'jina-key' | 'done';

type InitAppProps = {
  onCancel: VoidFunction;
};

export const InitApp: FC<InitAppProps> = ({ onCancel }) => {
  const [step, setStep] = useState<SettingsStep>('menu');
  const [llmKey, setLlmKey] = useState(config.get('llmApiKey') || '');
  const [jinaKey, setJinaKey] = useState(config.get('jinaApiKey') || '');
  const [ollamaUrl, setOllamaUrl] = useState(config.get('ollamaUrl') || 'http://localhost:11434');

  const handleMenuSelect = (item: { value: string }) => {
    if (item.value === 'llm') setStep('llm-provider');
    if (item.value === 'scraper') setStep('jina-key');
    if (item.value === 'back') onCancel();
  };

  const handleModelSelect = (item: { value: string }) => {
    config.set('preferredModel', item.value as any);
    if (item.value === 'openai' || item.value === 'deepseek') {
      setStep('llm-key');
    } else {
      setStep('ollama-url');
    }
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
            items={[
              { label: 'OpenAI (GPT-4o)', value: 'openai' },
              { label: 'DeepSeek (Official)', value: 'deepseek' },
              { label: 'Local Ollama', value: 'ollama' },
            ]}
            onSelect={handleModelSelect}
          />
        </Box>
      )}

      {step === 'llm-key' && (
        <Box flexDirection="column">
          <Text>Enter LLM API key:</Text>
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
