import { FC, useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { ScreenShell } from './ScreenShell';
import { jobUrlSchema } from '../utils/jobUrlSchema';

type JobUrlInputProps = {
  onSubmit: (url: string) => void;
  onCancel: VoidFunction;
};

export const JobUrlInput: FC<JobUrlInputProps> = ({ onSubmit, onCancel }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue === '' || trimmedValue.toLowerCase() === 'back') {
      setError(null);
      onCancel();
      return;
    }

    const result = jobUrlSchema.safeParse(trimmedValue);

    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Enter a valid public URL.');
      return;
    }

    setError(null);
    onSubmit(result.data);
  };

  return (
    <ScreenShell
      title="Job Offer"
      subtitle="Paste the public job URL to scrape the description, or go back to resume selection."
    >
      <Box marginTop={1}>
        <Text>[URL] ❯ </Text>
        <TextInput value={url} onChange={setUrl} onSubmit={handleSubmit} />
      </Box>
      <Box marginTop={1}>
        <Text italic color="gray">Press Enter to continue once the URL starts with `http`.</Text>
      </Box>
      {error ? (
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
      ) : null}
      <Box marginTop={1}>
        <Text color="gray">Submit `back` or an empty line to return to resume selection.</Text>
      </Box>
    </ScreenShell>
  );
};
