import { defineWidget } from './widget-element';
import type { DefineWidgetOptions } from './types';

const GLOBAL_KEY = 'RumorWebchatWidget' as const;

export interface RumorWebchatWidgetGlobal {
  define: (options?: DefineWidgetOptions) => string;
}

declare global {
  interface Window {
    RumorWebchatWidget?: RumorWebchatWidgetGlobal;
  }
  interface GlobalThis {
    RumorWebchatWidget?: RumorWebchatWidgetGlobal;
  }
}

const api: RumorWebchatWidgetGlobal = {
  define: defineWidget
};

if (typeof globalThis !== 'undefined') {
  const registrar = globalThis as typeof globalThis & Record<typeof GLOBAL_KEY, RumorWebchatWidgetGlobal>;
  if (!registrar[GLOBAL_KEY]) {
    registrar[GLOBAL_KEY] = api;
  }
}

if (typeof window !== 'undefined') {
  defineWidget();
}

export { defineWidget };
export type { DefineWidgetOptions } from './types';
