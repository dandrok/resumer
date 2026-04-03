import { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import TextInputImport from 'ink-text-input';
import SelectInputImport from 'ink-select-input';
import { config } from '../config';

const TextInput = (TextInputImport as any).default || TextInputImport;
const SelectInput = (SelectInputImport as any).default || SelectInputImport;

type Step = 'choose-model' | 'openai-key' | 'jina-key' | 'ollama-url' | 'done';

export const InitApp = () => {
  const { exit } = useApp();
  const [step, setStep] = useState<Step>('choose-model');
  const [openaiKey, setOpenaiKey] = useState(config.get('llmApiKey') || '');
  const [jinaKey, setJinaKey] = useState(config.get('jinaApiKey') || '');
  const [ollamaUrl, setOllamaUrl] = useState(config.get('ollamaUrl') || 'http://localhost:11434');

  const handleModelSelect = (item: { label: string; value: string }) => {
    config.set('preferredModel', item.value as any);
    if (item.value === 'openai' || item.value === 'deepseek') {
      setStep('openai-key');
    } else {
      setStep('ollama-url');
    }
  };

  const handleOpenaiSubmit = (value: string) => {
    config.set('llmApiKey', value);
    setStep('jina-key');
  };

  const handleJinaSubmit = (value: string) => {
    if (value.trim()) {
      config.set('jinaApiKey', value);
    }
    setStep('done');
  };

  const handleOllamaSubmit = (value: string) => {
    config.set('ollamaUrl', value);
    setStep('jina-key');
  };

  useEffect(() => {
    if (step === 'done') {
      setTimeout(() => exit(), 1000);
    }
  }, [step, exit]);

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="cyan" bold>Resumer Setup Wizard</Text>
      <Box marginTop={1}>
        {step === 'choose-model' && (
          <Box flexDirection="column">
            <Text>Choose your preferred LLM provider:</Text>
            <SelectInput
              items={[
                { label: 'OpenAI (GPT-4o/o1)', value: 'openai' },
                { label: 'Local Ollama', value: 'ollama' },
                { label: 'DeepSeek (via API)', value: 'deepseek' },
              ]}
              onSelect={handleModelSelect}
            />
          </Box>
        )}

        {step === 'openai-key' && (
          <Box flexDirection="column">
            <Text>Enter your API Key (OpenAI or DeepSeek compatible):</Text>
            <TextInput value={openaiKey} onChange={setOpenaiKey} onSubmit={handleOpenaiSubmit} mask="*" />
          </Box>
        )}

        {step === 'ollama-url' && (
          <Box flexDirection="column">
            <Text>Enter your Ollama URL:</Text>
            <TextInput value={ollamaUrl} onChange={setOllamaUrl} onSubmit={handleOllamaSubmit} />
          </Box>
        )}

        {step === 'jina-key' && (
          <Box flexDirection="column">
            <Text>Enter your Jina Reader API Key (Optional, press Enter to skip):</Text>
            <TextInput value={jinaKey} onChange={setJinaKey} onSubmit={handleJinaSubmit} mask="*" />
          </Box>
        )}

        {step === 'done' && (
          <Box>
            <Text color="green">Configuration saved successfully! Exiting...</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
