import { createRoot } from 'react-dom/client';
import App from './widget/App';
import type { DefineWidgetOptions, WidgetProps } from './types';
import widgetStyles from './widget/styles.css?inline';

const DEFAULT_TAG_NAME = 'rumor-webchat-widget';
const WIDGET_ATTRIBUTES = ['api-url', 'title', 'accent-color', 'initial-open'] as const;

type WidgetAttribute = (typeof WIDGET_ATTRIBUTES)[number];

type ReactRoot = ReturnType<typeof createRoot>;

const supportsConstructibleSheets =
  typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype;

const sharedSheet = supportsConstructibleSheets ? new CSSStyleSheet() : null;
if (sharedSheet) {
  sharedSheet.replaceSync(widgetStyles);
}

class RumorWebchatElement extends HTMLElement {
  private root?: ReactRoot;
  private mountNode?: HTMLDivElement;
  private styleElement?: HTMLStyleElement;
  private defaults: Partial<WidgetProps>;

  static get observedAttributes(): WidgetAttribute[] {
    return WIDGET_ATTRIBUTES.slice();
  }

  constructor(defaults: Partial<WidgetProps> = {}, shadowMode: ShadowRootMode = 'open') {
    super();
    this.defaults = defaults;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: shadowMode });
    }
  }

  connectedCallback(): void {
    this.ensureMount();
    this.render();
  }

  disconnectedCallback(): void {
    this.root?.unmount();
    this.root = undefined;
  }

  attributeChangedCallback(): void {
    if (this.isConnected) {
      this.render();
    }
  }

  private ensureMount(): void {
    if (!this.shadowRoot) {
      throw new Error('RumorWebchatElement requires ShadowRoot support.');
    }

    if (!this.mountNode) {
      this.mountNode = document.createElement('div');
      this.shadowRoot.appendChild(this.mountNode);
    }

    if (sharedSheet && 'adoptedStyleSheets' in this.shadowRoot) {
      const sheets = new Set(this.shadowRoot.adoptedStyleSheets);
      if (!sheets.has(sharedSheet)) {
        this.shadowRoot.adoptedStyleSheets = [...sheets, sharedSheet];
      }
    } else if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.textContent = widgetStyles;
      this.shadowRoot.appendChild(this.styleElement);
    }

    if (!this.root && this.mountNode) {
      this.root = createRoot(this.mountNode);
    }
  }

  private readProps(): WidgetProps {
    const attr = (name: WidgetAttribute): string | null => this.getAttribute(name);

    const initialOpenAttr = attr('initial-open');
    return {
      ...this.defaults,
      apiUrl: attr('api-url') ?? this.defaults.apiUrl,
      title: attr('title') ?? this.defaults.title,
      accentColor: attr('accent-color') ?? this.defaults.accentColor,
      initialOpen:
        initialOpenAttr != null
          ? initialOpenAttr === '' || initialOpenAttr.toLowerCase() === 'true'
          : this.defaults.initialOpen
    };
  }

  private render(): void {
    if (!this.root || !this.mountNode) {
      return;
    }

    this.root.render(<App {...this.readProps()} />);
  }
}

export function defineWidget(options: DefineWidgetOptions = {}): string {
  const { tagName = DEFAULT_TAG_NAME, shadowMode = 'open', defaults = {} } = options;

  if (customElements.get(tagName)) {
    return tagName;
  }

  const ElementClass = class extends RumorWebchatElement {
    constructor() {
      super(defaults, shadowMode);
    }
  };

  customElements.define(tagName, ElementClass);
  return tagName;
}
