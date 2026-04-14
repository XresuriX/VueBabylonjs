import { useEngine } from './useEngine';
import { useScene } from './useScene';

export const useBabylon = () => {
  const { engine, canvas } = useEngine();
  const scene = useScene();
  return { engine, scene, canvas };
};