import { FC, useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import fs from 'fs';
import path from 'path';
import { ScreenShell } from './ScreenShell';

type FileNavigatorProps = {
  error?: string | null;
  onSelect: (filePath: string) => void;
  onCancel: VoidFunction;
};

type FileItem = {
  label: string;
  value: string;
  isDirectory: boolean;
};

export const FileNavigator: FC<FileNavigatorProps> = ({ error, onSelect, onCancel }) => {
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
    <ScreenShell title="Select Resume" subtitle={`Current directory: ${currentDir}`}>
      {error ? (
        <Box marginBottom={1}>
          <Text color="red">{error}</Text>
        </Box>
      ) : null}
      <SelectInput items={items} onSelect={handleSelect} />
    </ScreenShell>
  );
};
