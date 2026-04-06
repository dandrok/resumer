import type { FC, PropsWithChildren, ReactNode } from 'react';
import { Box, Text } from 'ink';

type ScreenShellProps = PropsWithChildren<{
  title: string;
  subtitle?: ReactNode;
  titleColor?: 'blue' | 'cyan' | 'yellow' | 'green' | 'white';
}>;

export const ScreenShell: FC<ScreenShellProps> = ({
  children,
  subtitle,
  title,
  titleColor = 'cyan',
}) => (
  <Box flexDirection="column" padding={1} borderStyle="round" borderColor={titleColor}>
    <Text bold color={titleColor}>{title}</Text>
    {subtitle ? (
      <Box marginTop={1}>
        <Text color="gray">{subtitle}</Text>
      </Box>
    ) : null}
    <Box marginTop={1} flexDirection="column">
      {children}
    </Box>
  </Box>
);
