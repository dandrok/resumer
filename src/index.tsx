import { Command } from 'commander';
import { render } from 'ink';
import { App } from './ui/App';

const program = new Command();

program
  .name('resumer')
  .description('AI-Powered CLI/TUI Resume Tailor')
  .version('1.0.0')
  .action(async () => {
    const { waitUntilExit } = render(<App />);
    await waitUntilExit();
  });

program.parse();
