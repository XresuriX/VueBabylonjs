import { InjectionKey } from 'vue';
import type { Engine } from '@babylonjs/core';

export interface EngineContextValue {
  engine: Engine | null;
  canvas: HTMLCanvasElement | null;
}

export const EngineContext: InjectionKey<EngineContextValue> = Symbol('EngineContext');