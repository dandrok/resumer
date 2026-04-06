import { FC } from 'react';
import SelectInput from 'ink-select-input';
import { ScreenShell } from './ScreenShell';

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
    <ScreenShell
      title="Resumer"
      subtitle="AI-powered CLI/TUI resume tailoring for software-engineering roles."
    >
      <SelectInput items={items} onSelect={handleSelect} />
    </ScreenShell>
  );
};
