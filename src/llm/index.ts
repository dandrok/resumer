import { LanguageModel } from 'ai';
import { createConfiguredLlm } from './providers';

export const getLlm = (): LanguageModel => createConfiguredLlm();
