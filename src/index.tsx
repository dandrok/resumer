import { Command } from 'commander';
import { render } from 'ink';
import { TailorApp } from './ui/TailorApp';
import { InitApp } from './ui/InitApp';

const program = new Command();

program
  .name('resumer')
  .description('AI-Powered CLI/TUI Resume Tailor')
  .version('1.0.0');

program
  .command('init')
  .description('Setup API keys and configuration')
  .action(async () => {
    const { waitUntilExit } = render(<InitApp />);
    await waitUntilExit();
  });

program
  .command('tailor')
  .description('Tailor your resume for a job offer')
  .argument('<resumePath>', 'Path to your resume PDF')
  .argument('<jobUrl>', 'URL of the job offer')
  .action(async (resumePath, jobUrl) => {
    const { waitUntilExit } = render(<TailorApp resumePath={resumePath} jobUrl={jobUrl} />);
    await waitUntilExit();
  });

program.parse();
