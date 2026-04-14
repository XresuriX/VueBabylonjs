import { inject } from 'vue';
import { SceneContext } from '../context/SceneContext';
import type { Scene } from '@babylonjs/core';

export const useScene = (): Scene => {
  const scene = inject(SceneContext);
  if (!scene) {
    throw new Error('useScene must be used within a Scene provider');
  }
  return scene;
};