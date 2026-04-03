import { FC, useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';


type JobUrlInputProps = {
  onSubmit: (url: string) => void;
  onCancel: VoidFunction;
};

export const JobUrlInput: FC<JobUrlInputProps> = ({ onSubmit, onCancel }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (value: string) => {
    if (value.startsWith('http')) {
      onSubmit(value);
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Job Offer Details</Text>
      <Box marginTop={1}>
        <Text> [URL] ❯ </Text>
        <TextInput value={url} onChange={setUrl} onSubmit={handleSubmit} />
      </Box>
      <Text italic color="gray" > Enter the URL to scrape the job description </Text>
    </Box>
  );
};
