import { FC, useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import fs from 'fs';
import path from 'path';

type FileNavigatorProps = {
  onSelect: (filePath: string) => void;
  onCancel: VoidFunction;
};

type FileItem = {
  label: string;
  value: string;
  isDirectory: boolean;
};

export const FileNavigator: FC<FileNavigatorProps> = ({ onSelect, onCancel }) => {
  const [currentDir, setCurrentDir] = useState(process.cwd());
  const [items, setItems] = useState<FileItem[]>([]);

  useEffect(() => {
    try {
      const dirContent = fs.readdirSync(currentDir, { withFileTypes: true });

      const fileItems: FileItem[] = dirContent
        .map(dirent => ({
          label: dirent.isDirectory() ? `cd /${dirent.name}` : dirent.name,
          value: path.join(currentDir, dirent.name),
          isDirectory: dirent.isDirectory()
        }))
        .filter(item => item.isDirectory || item.value.toLowerCase().endsWith('.pdf'))
        .sort((a, b) => (a.isDirectory === b.isDirectory ? a.label.localeCompare(b.label) : a.isDirectory ? -1 : 1));

      const parentDir = path.dirname(currentDir);
      if (parentDir !== currentDir) {
        fileItems.unshift({ label: 'cd ..', value: parentDir, isDirectory: true });
      }

      fileItems.push({ label: 'abort selection', value: 'cancel', isDirectory: false });

      setItems(fileItems);
    } catch (err) {
      setItems([{ label: 'cd ..', value: path.dirname(currentDir), isDirectory: true }, { label: 'abort selection', value: 'cancel', isDirectory: false }]);
    }
  }, [currentDir]);

  const handleSelect = (item: { value: string }) => {
    if (item.value === 'cancel') {
      onCancel();
      return;
    }

    const fileItem = items.find(i => i.value === item.value);

    if (fileItem?.isDirectory) {
      setCurrentDir(item.value);
    } else {
      onSelect(item.value);
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="yellow">NAVIGATE TO YOUR RESUME</Text>
      <Text color="gray">pwd: {currentDir}</Text>
      <Box marginTop={1}>
        <SelectInput items={items} onSelect={handleSelect} />
      </Box>
    </Box>
  );
};
