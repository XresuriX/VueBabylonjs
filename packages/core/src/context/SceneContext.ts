import { InjectionKey } from 'vue';
import type { Scene } from '@babylonjs/core';

export const SceneContext: InjectionKey<Scene> = Symbol('SceneContext');