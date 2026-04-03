import { FC } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

type MainMenuProps = {
  onSelect: (value: 'tailor' | 'settings' | 'exit') => void;
};

export const MainMenu: FC<MainMenuProps> = ({ onSelect }) => {
  const items = [
    { label: 'Tailor Resume', value: 'tailor' as const },
    { label: 'App Settings', value: 'settings' as const },
    { label: 'Terminate Session', value: 'exit' as const },
  ];

  const handleSelect = (item: { value: 'tailor' | 'settings' | 'exit' }) => {
    onSelect(item.value);
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Resumer v0.1.0</Text>
      <Box marginTop={1}>
        <SelectInput items={items} onSelect={handleSelect} />
      </Box>
    </Box>
  );
};
