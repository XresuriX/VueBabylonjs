# VueBabylonJS Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete upgrade to full-featured Vue 3 + Babylon.js integration library with feature parity to react-babylonjs

**Architecture:** Hybrid approach - code-gen for core Babylon types (meshes, cameras, lights, materials), manual implementation for advanced features (Context API, hooks, physics, GUI, behaviors)

**Tech Stack:** Vue 3.5+, Babylon.js 7+, TypeScript 5.7+, Vite 6+, Vitest, Storybook 8+

---

## Phase 1: Foundation (Week 1)

### Task 1: Set up Storybook

**Files:**
- Create: `packages/core/.storybook/main.ts`
- Create: `packages/core/.storybook/preview.ts`
- Create: `packages/core/stories/index.stories.ts`
- Modify: `packages/core/package.json`
- Test: Manual verification via Storybook UI

- [ ] **Step 1: Install Storybook dependencies**

```bash
cd packages/core
npx storybook@latest init --type vue3 --builder vite --yes
```

- [ ] **Step 2: Configure Storybook**

Create `packages/core/.storybook/main.ts`:
```typescript
import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
};
export default config;
```

Create `packages/core/.storybook/preview.ts`:
```typescript
import type { Preview } from '@storybook/vue3';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)(?!-initial)/,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
```

- [ ] **Step 3: Verify Storybook runs**

```bash
cd packages/core
npm run storybook
```
Expected: Storybook opens at localhost:6006

- [ ] **Step 4: Create basic scene story**

Create `packages/core/stories/index.stories.ts`:
```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder } from '@babylonjs/core';
import { ref, onMounted } from 'vue';

const meta: Meta = {
  title: 'Basic/Scene',
  component: 'div',
  tags: ['autodocs'],
};

export default meta;
type StoryObj = StoryObj;

export const BasicScene: StoryObj = {
  render: () => ({
    setup() {
      const canvasRef = ref<HTMLCanvasElement>();
      
      onMounted(() => {
        if (!canvasRef.value) return;
        const engine = new Engine(canvasRef.value, true);
        const scene = new Scene(engine);
        const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
        camera.attachControl(canvasRef.value, true);
        new HemisphericLight('light', new Vector3(0, 1, 0), scene);
        MeshBuilder.CreateBox('box', {}, scene);
        engine.runRenderLoop(() => scene.render());
      });
      
      return () => () => <canvas ref={canvasRef} style={{ width: '100%', height: '400px' }} />;
    },
  }),
};
```

- [ ] **Step 5: Commit**

```bash
git add packages/core/.storybook packages/core/stories packages/core/package.json
git commit -m "feat: add Storybook configuration"
```

---

### Task 2: Implement Context API

**Files:**
- Create: `packages/core/src/context/EngineContext.ts`
- Create: `packages/core/src/context/SceneContext.ts`
- Create: `packages/core/src/context/index.ts`
- Create: `packages/core/src/composables/useEngine.ts`
- Create: `packages/core/src/composables/useScene.ts`
- Create: `packages/core/src/composables/useBabylon.ts`
- Modify: `packages/core/src/composables/index.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/composables/useEngine.test.ts`

- [ ] **Step 1: Create EngineContext**

Create `packages/core/src/context/EngineContext.ts`:
```typescript
import { createContext } from 'vue';
import type { Engine } from '@babylonjs/core';

export interface EngineContextValue {
  engine: Engine | null;
  canvas: HTMLCanvasElement | null;
}

export const EngineContext = createContext<EngineContextValue | null>(null, 'EngineContext');
```

- [ ] **Step 2: Create SceneContext**

Create `packages/core/src/context/SceneContext.ts`:
```typescript
import { createContext } from 'vue';
import type { Scene } from '@babylonjs/core';

export const SceneContext = createContext<Scene | null>(null, 'SceneContext');
```

- [ ] **Step 3: Create context index**

Create `packages/core/src/context/index.ts`:
```typescript
export { EngineContext } from './EngineContext';
export { SceneContext } from './SceneContext';
export type { EngineContextValue } from './EngineContext';
```

- [ ] **Step 4: Create useEngine composable**

Create `packages/core/src/composables/useEngine.ts`:
```typescript
import { inject } from 'vue';
import { EngineContext, type EngineContextValue } from '../context/EngineContext';

export const useEngine = (): EngineContextValue => {
  const context = inject<EngineContextValue | null>(EngineContext, null);
  if (!context) {
    throw new Error('useEngine must be used within an Engine provider');
  }
  return context;
};
```

- [ ] **Step 5: Create useScene composable**

Create `packages/core/src/composables/useScene.ts`:
```typescript
import { inject } from 'vue';
import { SceneContext } from '../context/SceneContext';
import type { Scene } from '@babylonjs/core';

export const useScene = (): Scene => {
  const scene = inject<Scene | null>(SceneContext, null);
  if (!scene) {
    throw new Error('useScene must be used within a Scene provider');
  }
  return scene;
};
```

- [ ] **Step 6: Create useBabylon composable (combined)**

Create `packages/core/src/composables/useBabylon.ts`:
```typescript
import { useEngine } from './useEngine';
import { useScene } from './useScene';

export const useBabylon = () => {
  const engine = useEngine();
  const scene = useScene();
  return { ...engine, scene };
};
```

- [ ] **Step 7: Update composables index**

Modify `packages/core/src/composables/index.ts` - add:
```typescript
export { useEngine } from './useEngine';
export { useScene } from './useScene';
export { useBabylon } from './useBabylon';
```

- [ ] **Step 8: Update main index**

Modify `packages/core/src/index.ts` - add context exports:
```typescript
export * from './context';
export * from './composables';
```

- [ ] **Step 9: Write test for useEngine**

Create `packages/core/src/composables/useEngine.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { Engine } from '@babylonjs/core';
import { useEngine } from './useEngine';

describe('useEngine', () => {
  it('should throw when used outside provider', () => {
    const TestComponent = {
      setup() {
        useEngine();
        return () => null;
      },
    };
    
    const wrapper = mount(TestComponent, {
      global: {
        config: {
          errorHandler: null,
        },
      },
    });
    
    expect(wrapper.vm.$.appContext.provides[EngineContext as any]).toBe(undefined);
  });
});
```

- [ ] **Step 10: Commit**

```bash
git add packages/core/src/context packages/core/src/composables/useEngine.ts packages/core/src/composables/useScene.ts packages/core/src/composables/useBabylon.ts packages/core/src/composables/index.ts packages/core/src/index.ts
git commit -m "feat: add Context API (EngineContext, SceneContext, useEngine, useScene, useBabylon)"
```

---

### Task 3: Create Engine and Scene root components

**Files:**
- Create: `packages/core/src/components/Engine.vue`
- Create: `packages/core/src/components/Scene.vue`
- Modify: `packages/core/src/components/index.ts`
- Test: Manual verify with playground

- [ ] **Step 1: Create Engine component**

Create `packages/core/src/components/Engine.vue`:
```vue
<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted, shallowRef } from 'vue';
import { Engine } from '@babylonjs/core';
import { EngineContext } from '../context/EngineContext';

const props = defineProps<{
  options?: {
    antialias?: boolean;
    preserveDrawingBuffer?: boolean;
    stencil?: boolean;
    disableWebGL2Support?: boolean;
    adaptToDeviceRatio?: boolean;
  };
  engineOptions?: {
    preserveDrawingBuffer?: boolean;
    stencil?: boolean;
    disableWebGL2Support?: boolean;
    adaptToDeviceRatio?: boolean;
  };
}>();

const emit = defineEmits<{
  created: [engine: Engine];
  ready: [engine: Engine];
}>();

const canvasRef = ref<HTMLCanvasElement>();
const engineRef = shallowRef<Engine | null>(null);

provide(EngineContext, {
  engine: engineRef,
  canvas: canvasRef,
});

const initEngine = () => {
  if (!canvasRef.value) return;
  
  const options = { 
    antialias: true, 
    adaptToDeviceRatio: true,
    ...props.options,
    ...props.engineOptions 
  };
  
  engineRef.value = new Engine(canvasRef.value, props.antialias ?? true, options);
  emit('created', engineRef.value);
  
  window.addEventListener('resize', handleResize);
  emit('ready', engineRef.value);
};

const handleResize = () => {
  engineRef.value?.resize();
};

onMounted(() => {
  initEngine();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  engineRef.value?.dispose();
});
</script>

<template>
  <canvas ref="canvasRef" style="width: 100%; height: 100%; display: block" />
  <slot />
</template>
```

- [ ] **Step 2: Create Scene component**

Create `packages/core/src/components/Scene.vue`:
```vue
<script setup lang="ts">
import { provide, onMounted, shallowRef } from 'vue';
import { Scene } from '@babylonjs/core';
import { SceneContext } from '../context/SceneContext';
import { inject } from 'vue';
import { EngineContext } from '../context/EngineContext';

const props = defineProps<{
  options?: {
    virtual?: boolean;
    preserveDrawingBuffer?: boolean;
    autoClear?: boolean;
    clearColor?: any;
    temporallyTreatedAsStatic?: boolean;
  };
}>();

const emit = defineEmits<{
  created: [scene: Scene];
  ready: [scene: Scene];
}>();

const engineContext = inject(EngineContext);
if (!engineContext?.engine) {
  throw new Error('Scene must be used within Engine');
}

const scene = new Scene(engineContext.engine, props.options?.virtual);
provide(SceneContext, scene);

emit('created', scene);
emit('ready', scene);
</script>

<template>
  <slot :scene="scene" />
</template>
```

- [ ] **Step 3: Update components index**

Modify `packages/core/src/components/index.ts`:
```typescript
export * from './cameras';
export * from './lights';
export * from './materials';
export * from './meshes';

import Engine from './Engine.vue';
import Scene from './Scene.vue';
import BabyuewScene from './babyuewScene.vue';

export { Engine, Scene, BabyuewScene };
```

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/components/Engine.vue packages/core/src/components/Scene.vue packages/core/src/components/index.ts
git commit -m "feat: add Engine and Scene root components"
```

---

### Task 4: Fix existing components to use new API

**Files:**
- Modify: `packages/core/src/components/babyuewScene.vue`
- Modify: `packages/core/src/components/meshes/box.vue`
- Modify: `packages/core/src/components/meshes/sphere.vue`
- Modify: `packages/core/src/components/cameras/arcRotateCamera.vue`
- Modify: `packages/core/src/components/lights/directionalLight.vue`
- Modify: `packages/core/src/components/materials/standardMaterial.vue`
- Test: Verify existing playground works

- [ ] **Step 1: Read existing box component**

Read `packages/core/src/components/meshes/box.vue` to understand current implementation

- [ ] **Step 2: Update box to use SceneContext**

Modify `packages/core/src/components/meshes/box.vue` - update to use inject:
```vue
<script setup lang="ts">
import { inject } from 'vue';
import { MeshBuilder, Mesh, VertexData } from '@babylonjs/core';
import { SceneContext } from '../../context/SceneContext';
import { shallowRef } from 'vue';

const props = defineProps<{
  name?: string;
  options?: {
    size?: number;
    width?: number;
    height?: number;
    depth?: number;
    faceColors?: any;
    wrap?: boolean;
    sideOrientation?: number;
    updatable?: boolean;
  };
}>();

const scene = inject(SceneContext);
if (!scene) {
  throw new Error('Box must be used within a Scene');
}

const mesh = MeshBuilder.CreateBox(props.name || 'box', props.options || {}, scene);
const meshRef = shallowRef(mesh);

defineExpose({ mesh: meshRef });
</script>

<template>
  <slot :mesh="mesh" />
</template>
```

- [ ] **Step 3: Update Sphere similarly**

- [ ] **Step 4: Update Camera to inject Engine and Scene**

- [ ] **Step 5: Update Light similarly**

- [ ] **Step 6: Update Material similarly**

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/components/meshes packages/core/src/components/cameras packages/core/src/components/lights packages/core/src/components/materials
git commit -m "fix: update existing components to use new Context API"
```

---

## Phase 2: Code-Gen (Week 2)

### Task 5: Set up code-gen CLI

**Files:**
- Create: `packages/code-gen/package.json`
- Create: `packages/code-gen/src/index.ts`
- Create: `packages/code-gen/src/parser.ts`
- Create: `packages/code-gen/src/templates/component.vue`
- Create: `packages/code-gen/package.json`
- Test: Run code-gen to generate components

- [ ] **Step 1: Create code-gen package**

Create `packages/code-gen/package.json`:
```json
{
  "name": "@vue-babylonjs/code-gen",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@babylonjs/core": "^7.0.0",
    "commander": "^12.0.0",
    "fs-extra": "^11.2.0",
    "handlebars": "^4.7.8"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^20.8.8",
    "typescript": "^5.2.2"
  }
}
```

- [ ] **Step 2: Create index.ts**

Create `packages/code-gen/src/index.ts`:
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { parseTypes } from './parser';
import { generateComponents } from './templates';

const program = new Command();

program
  .name('vue-babylonjs-codegen')
  .description('Code-gen Vue components from Babylon.js types')
  .option('-i, --input <path>', 'Input path for @babylonjs/core types')
  .option('-o, --output <path>', 'Output path for generated components')
  .parse();

const options = program.opts();
generateComponents(options.output);
```

- [ ] **Step 3: Create parser.ts**

Create `packages/code-gen/src/parser.ts`:
```typescript
import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface BabylonType {
  name: string;
  module: string;
  properties: TypeProperty[];
}

export interface TypeProperty {
  name: string;
  type: string;
  optional: boolean;
}

export function parseTypes(packagePath: string): BabylonType[] {
  // Parse TypeScript definitions from @babylonjs/core
  // Extract interface and class definitions
  // Map to component props
  return types;
}
```

- [ ] **Step 4: Create templates**

Create component Vue SFC templates with handlebars

- [ ] **Step 5: Run code-gen**

```bash
cd packages/code-gen
npm run build
node dist/index.js --output ../core/src/components/generated
```

- [ ] **Step 6: Commit**

```bash
git add packages/code-gen
git commit -m "feat: add code-gen CLI for Babylon.js types"
```

---

### Task 6: Generate mesh, camera, light, material components

**Files:**
- Output: `packages/core/src/components/generated/meshes/`
- Output: `packages/core/src/components/generated/cameras/`
- Output: `packages/core/src/components/generated/lights/`
- Output: `packages/core/src/components/generated/materials/`
- Test: Verify all 50+ generated components work

- [ ] **Step 1: Run code-gen for meshes**

- [ ] **Step 2: Run code-gen for cameras**

- [ ] **Step 3: Run code-gen for lights**

- [ ] **Step 4: Run code-gen for materials**

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/components/generated
git commit -m "feat: generated 50+ components from Babylon.js types"
```

---

## Phase 3: Hooks (Week 3)

### Task 7: Implement manual hooks

**Files:**
- Create: `packages/core/src/composables/usePointerOver.ts`
- Create: `packages/core/src/composables/usePointerDown.ts`
- Create: `packages/core/src/composables/useAnimation.ts`
- Create: `packages/core/src/composables/useOnSceneReady.ts`
- Modify: `packages/core/src/composables/index.ts`
- Test: Write tests for each hook

- [ ] **Step 1: Create usePointerOver**

Create `packages/core/src/composables/usePointerOver.ts`:
```typescript
import { onMounted, onUnmounted } from 'vue';
import { AbstractMesh } from '@babylonjs/core';
import type { Ref } from 'vue';

export function usePointerOver(
  meshRef: Ref<AbstractMesh | null>,
  callback: (mesh: AbstractMesh) => void
) {
  let observable = null;
  
  onMounted(() => {
    if (!meshRef.value) return;
    observable = meshRef.value.actionManager?.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, callback)
    );
  });
  
  onUnmounted(() => {
    observable?.dispose();
  });
}
```

- [ ] **Step 2: Create usePointerDown**

- [ ] **Step 3: Create useAnimation**

- [ ] **Step 4: Create useOnSceneReady**

- [ ] **Step 5: Update index and commit**

```bash
git add packages/core/src/composables/use*.ts
git commit -m "feat: add manual hooks (usePointerOver, usePointerDown, useAnimation)"
```

---

## Phase 4: Advanced Features (Week 4)

### Task 8: Physics component

**Files:**
- Create: `packages/core/src/components/advanced/Physics.vue`
- Modify: `packages/core/src/components/index.ts`
- Test: Create physics story

- [ ] **Step 1: Create Physics component**

- [ ] **Step 2: Add to exports**

- [ ] **Step 3: Commit**

---

### Task 9: GUI component

**Files:**
- Create: `packages/core/src/components/advanced/GUI.vue`
- Create: `packages/core/src/components/advanced/AdvancedContainer.vue`
- Test: Create GUI story

- [ ] **Step 1: Create GUI component**

- [ ] **Step 2: Create AdvancedContainer**

- [ ] **Step 3: Commit**

---

### Task 10: ShadowGenerator, Particles, Behaviors

**Files:**
- Create: `packages/core/src/components/advanced/ShadowGenerator.vue`
- Create: `packages/core/src/components/advanced/ParticleSystem.vue`
- Create: `packages/core/src/components/advanced/Behaviors.vue`
- Test: Create stories

- [ ] **Step 1: Create ShadowGenerator**

- [ ] **Step 2: Create ParticleSystem**

- [ ] **Step 3: Create Behaviors**

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/components/advanced
git commit -m "feat: add advanced components (Physics, GUI, ShadowGenerator, Particles, Behaviors)"
```

---

## Phase 5: Documentation & Polish

### Task 11: Complete Storybook examples

**Files:**
- Create: 20+ stories in `packages/core/stories/`
- Test: All stories render

### Task 12: API documentation

**Files:**
- Configure TypeDoc in tsconfig.json
- Generate API docs

### Task 13: Final testing and release

**Files:**
- Run full test suite
- Version bump and publish

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-04-14-vue-babylonjs-upgrade.md`. Two execution options:**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**