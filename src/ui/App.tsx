import { FC, useState } from 'react';
import { MainMenu } from './MainMenu';
import { FileNavigator } from './FileNavigator';
import { JobUrlInput } from './JobUrlInput';
import { TailorApp } from './TailorApp';
import { InitApp } from './InitApp';
import { validateResumePdf } from '../utils/pdf';

type AppPhase = 'menu' | 'select-cv' | 'input-url' | 'tailoring' | 'settings' | 'exit';

export const App: FC = () => {
  const [phase, setPhase] = useState<AppPhase>('menu');
  const [fileError, setFileError] = useState<string | null>(null);
  const [resumePath, setResumePath] = useState('');
  const [jobUrl, setJobUrl] = useState('');

  const handleMenuSelect = (value: string) => {
    if (value === 'tailor') setPhase('select-cv');
    if (value === 'settings') setPhase('settings');
    if (value === 'exit') setPhase('exit');
  };

  const handleCvSelect = async (path: string) => {
    try {
      await validateResumePdf(path);
      setFileError(null);
      setResumePath(path);
      setPhase('input-url');
    } catch (err: any) {
      setFileError(err.message || 'Selected PDF could not be validated.');
      setPhase('select-cv');
    }
  };

  const handleUrlSubmit = (url: string) => {
    setJobUrl(url);
    setPhase('tailoring');
  };

  const resetToMenu = () => {
    setFileError(null);
    setPhase('menu');
  };

  if (phase === 'menu') return <MainMenu onSelect={handleMenuSelect} />;
  if (phase === 'select-cv') return <FileNavigator error={fileError} onSelect={handleCvSelect} onCancel={resetToMenu} />;
  if (phase === 'input-url') return <JobUrlInput onSubmit={handleUrlSubmit} onCancel={resetToMenu} />;
  if (phase === 'tailoring') return <TailorApp resumePath={resumePath} jobUrl={jobUrl} />;
  if (phase === 'settings') return <InitApp onCancel={resetToMenu} />;

  return null;
};
