# VueBabylonJS Upgrade Design

**Date:** 2026-04-14
**Status:** Approved

## 1. Overview

Upgrade `vue-babylonjs` (BabyuewJS) to a full-featured Vue 3 + Babylon.js integration library with feature parity to `react-babylonjs`, using a hybrid architecture (code-gen + manual).

### Goals

- Code-gen declarative components from Babylon.js types
- Context API for Engine/Scene/Canvas access
- Manual hooks for interactions
- Full Storybook documentation
- Modern, user-friendly API

## 2. Architecture

### 2.1 Monorepo Structure

```
vue-babylonjs/
├── packages/
│   ├── core/           # Main library
│   ├── code-gen/       # Code generation CLI
│   └── tests/          # Test utilities
├── playgrounds/
│   └── demo/           # Demo app
└── docs/
    └── storybook/      # Storybook docs
```

### 2.2 Hybrid Architecture

| Layer | Approach | Contents |
|-------|----------|----------|
| Generated | CLI from Babylon.js types | Meshes, Lights, Cameras, Materials, TransformNodes |
| Manual | Vue-specific implementation | Context, Hooks, Physics, GUI, Behaviors, Particles |

### 2.3 Context API

```typescript
// Engine Context
const { engine, canvas } = useEngine();
// equivalent to React: const { engine, canvas } = useEngine()

// Scene Context  
const { scene } = useScene();
// equivalent to React: const scene = useScene()

// Combined access
const { engine, scene, canvas } = useBabylon();
```

### 2.4 Generated Components

Code-gen Vue SFC components from Babylon.js type definitions:

```vue
<MeshBuilder :options="boxOptions" />
<ArcRotateCamera :options="cameraOptions" />
<StandardMaterial :options="materialOptions" />
```

Props map 1:1 to Babylon.js constructor parameters.

### 2.5 Manual Hooks

```typescript
// Pointer events
const meshRef = ref();
usePointerOver(meshRef, () => { /* hover logic */ });
usePointerOut(meshRef, () => { /* leave logic */ });
usePointerDown(meshRef, () => { /* click logic */ });

// Animation
useAnimation(meshRef, 'position.x', { from: 0, to: 10 });

// Scene
useOnSceneReady((scene) => { /* scene ready */ });
```

### 2.6 Advanced Components

Manual implementation for features requiring Vue logic:

- `<PhysicsV2 />` - Physics integration
- `<ShadowGenerator />` - Shadow mapping
- `<GUI />` - 2D GUI (Babylon.GUI)
- `<ParticleSystem />` - Particles
- `<Portal />` - Portal rendering
- `<RenderOnDemand />` - Custom render loops
- `<EffectLayers />` - Glow, highlight effects
- `<Behaviors />` - Pointer drag, etc.

## 3. API Design

### 3.1 Root Component

```vue
<template>
  <Engine :options="engineOptions">
    <Scene>
      <!-- declarative scene content -->
    </Scene>
  </Engine>
</template>
```

### 3.2 Props Naming Convention

- Use PascalCase for component names (`ArcRotateCamera`)
- Use camelCase for prop names (equivalent to Babylon.js)
- Boolean props default to `false`
- Nullable types use `undefined` as default

### 3.3 Event Handling

- Babylon events exposed as Vue events with `on` prefix
- `onCreated` - callback when Babylon object created
- `onReady` - callback when scene is ready

### 3.4 Reactivity

- Props are reactive - changes update Babylon objects
- Use `shallowRef` for Babylon objects to avoid proxy overhead

## 4. File Structure

```
packages/core/src/
├── components/
│   ├── generated/        # Code-gen output (do not edit)
│   │   ├── meshes/
│   │   ├── cameras/
│   │   ├── lights/
│   │   └── materials/
│   ├── advanced/         # Manual implementation
│   │   ├── physics/
│   │   ├── gui/
│   │   ├── particles/
│   │   └── behaviors/
│   ├── Scene.vue
│   ├── Engine.vue
│   └── index.ts
├── composables/
│   ├── useEngine.ts
│   ├── useScene.ts
│   ├── useBabylon.ts
│   ├── usePointerOver.ts
│   ├── usePointerDown.ts
│   ├── useAnimation.ts
│   └── index.ts
├── context/
│   ├── EngineContext.ts
│   ├── SceneContext.ts
│   └── index.ts
├── code-gen/
│   └── templates/         # Code-gen templates
└── types/
    └── index.ts
```

## 5. Code Generation

### 5.1 CLI Tool

```bash
vue-babylonjs-codegen --input @babylonjs/core --output ./src/components/generated
```

### 5.2 Process

1. Parse Babylon.js type definitions
2. Extract constructor options
3. Generate Vue SFC with props
4. Generate TypeScript types

### 5.3 Template Example

```vue
<script setup lang="ts">
import { computed, toRefs } from 'vue';
import type { MeshBuilderOptions } from '@babylonjs/core';

const props = defineProps<MeshBuilderOptions>();
const mesh = new MeshBuilder.CreateBox('box', props, scene);
</script>

<template>
  <!-- rendered by parent -->
</template>
```

## 6. Documentation

### 6.1 Storybook

- Live interactive examples
- Props table auto-generated
- Code snippets with copy button

### 6.2 Website

- Getting started guide
- API reference
- Examples gallery

### 6.3 TypeDoc

- Generate API docs from TypeScript
- Include code examples

## 7. Testing

### 7.1 Unit Tests

- Vitest for composables
- Test context providers
- Test hook behavior

### 7.2 Integration Tests

- Test rendering with @vue/test-utils
- Test Babylon object creation

## 8. Dependencies

```json
{
  "dependencies": {
    "@babylonjs/core": "^7.0.0",
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0",
    "@vue/test-utils": "^2.4.0",
    "storybook": "^8.0.0"
  }
}
```

## 9. Migration Path

### Phase 1: Foundation (Week 1)
- Set up Storybook
- Implement Context API
- Fix existing components

### Phase 2: Code-Gen (Week 2)
- Build code-gen CLI
- Generate mesh/camera/light/material components

### Phase 3: Hooks (Week 3)
- Implement manual hooks
- Implement pointer events

### Phase 4: Advanced (Week 4)
- Physics, GUI, Particles, Behaviors
- Full Storybook examples

### Phase 5: Polish
- Documentation
- Testing
- Release

## 10. Success Criteria

- [ ] Context API working (`useEngine`, `useScene`, `useBabylon`)
- [ ] Code-gen generates 50+ components
- [ ] Hooks working (`usePointerOver`, `usePointerDown`)
- [ ] Physics component working
- [ ] GUI component working
- [ ] Storybook with 20+ examples
- [ ] 80% test coverage
- [ ] Published to npm