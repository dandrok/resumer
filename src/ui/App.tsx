import { FC, useState } from 'react';
import { MainMenu } from './MainMenu';
import { FileNavigator } from './FileNavigator';
import { JobUrlInput } from './JobUrlInput';
import { TailorApp } from './TailorApp';
import { InitApp } from './InitApp';

type AppPhase = 'menu' | 'select-cv' | 'input-url' | 'tailoring' | 'settings' | 'exit';

export const App: FC = () => {
  const [phase, setPhase] = useState<AppPhase>('menu');
  const [resumePath, setResumePath] = useState('');
  const [jobUrl, setJobUrl] = useState('');

  const handleMenuSelect = (value: string) => {
    if (value === 'tailor') setPhase('select-cv');
    if (value === 'settings') setPhase('settings');
    if (value === 'exit') setPhase('exit');
  };

  const handleCvSelect = (path: string) => {
    setResumePath(path);
    setPhase('input-url');
  };

  const handleUrlSubmit = (url: string) => {
    setJobUrl(url);
    setPhase('tailoring');
  };

  const resetToMenu = () => setPhase('menu');

  if (phase === 'menu') return <MainMenu onSelect={handleMenuSelect} />;
  if (phase === 'select-cv') return <FileNavigator onSelect={handleCvSelect} onCancel={resetToMenu} />;
  if (phase === 'input-url') return <JobUrlInput onSubmit={handleUrlSubmit} onCancel={resetToMenu} />;
  if (phase === 'tailoring') return <TailorApp resumePath={resumePath} jobUrl={jobUrl} />;
  if (phase === 'settings') return <InitApp onCancel={resetToMenu} />;

  return null;
};
