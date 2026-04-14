import type { Meta, StoryObj } from '@storybook/vue3';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3 } from '@babylonjs/core';
import { ref, onMounted, onUnmounted, defineComponent, h } from 'vue';

const meta: Meta = {
  title: 'Basic/Scene',
  component: defineComponent({
    name: 'BasicScene',
    setup() {
      const canvasRef = ref<HTMLCanvasElement>();
      let engine: Engine | null = null;
      let scene: Scene | null = null;

      onMounted(() => {
        if (!canvasRef.value) return;
        engine = new Engine(canvasRef.value, true);
        scene = new Scene(engine);
        const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 10, Vector3.Zero(), scene);
        camera.attachControl(canvasRef.value, true);
        new HemisphericLight('light', new Vector3(0, 1, 0), scene);
        MeshBuilder.CreateBox('box', { size: 2 }, scene);
        engine.runRenderLoop(() => scene?.render());
      });

      onUnmounted(() => {
        engine?.dispose();
      });

      return () => h('canvas', { ref: canvasRef, style: { width: '100%', height: '400px' } });
    },
  }),
  tags: ['autodocs'],
};

export default meta;
type StoryObj = StoryObj;

export const BasicScene: StoryObj = {};