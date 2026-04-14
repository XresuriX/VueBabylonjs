import { inject } from 'vue';
import { EngineContext, type EngineContextValue } from '../context/EngineContext';

export const useEngine = (): EngineContextValue => {
  const context = inject(EngineContext);
  if (!context) {
    throw new Error('useEngine must be used within an Engine provider');
  }
  return context;
};