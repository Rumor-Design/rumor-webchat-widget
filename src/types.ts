export interface WidgetProps {
  /** Optional API endpoint the widget will talk to. */
  apiUrl?: string;
  /** Display name rendered in the widget header. */
  title?: string;
  /** Accent color token (CSS color). */
  accentColor?: string;
  /** Whether the chat panel is initially open. */
  initialOpen?: boolean;
}

export interface DefineWidgetOptions {
  /** Custom tag name for the registered custom element. */
  tagName?: string;
  /** Shadow DOM mode; defaults to open to allow outside inspection. */
  shadowMode?: ShadowRootMode;
  /** Default props applied to every instance. */
  defaults?: Partial<WidgetProps>;
}
