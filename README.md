# Rumor Webchat Widget

Embeddable React + TypeScript chat widget packaged as a custom element with Shadow DOM
isolation. The widget can be dropped into any third-party site via a `<script>` tag without
bleeding styles or requiring the host application to run React.

## Features

- **Shadow DOM isolation** – prevents host-page CSS collisions and keeps layout predictable.
- **One-line embed** – load the UMD bundle and place `<rumor-webchat-widget>` anywhere on the page.
- **Bootstrap API** – exposes `window.RumorWebchatWidget.define(...)` to register additional tag names.
- **Typed React components** – modern hooks-based UI written in strict TypeScript.
- **Build ready** – Vite library mode outputs ES and UMD bundles with sourcemaps.

## Getting Started

```bash
npm install
npm run dev       # local playground with hot reload
npm run build     # generates dist/rumor-webchat-widget.{es,umd}.js
npm run preview   # serves the built bundle for manual QA
```

To see the widget in action inside a plain HTML page:

1. Run `npm run build`.
2. Open `examples/embed.html` in a browser (it loads the UMD bundle from `dist/`).

## Embedding the Widget

### UMD script tag (recommended for third-party sites)

```html
<script src="https://cdn.example.com/rumor-webchat-widget.umd.js" defer></script>
<rumor-webchat-widget api-url="https://api.rumor.io/chat" title="Rumor Concierge"></rumor-webchat-widget>
```

### ES module (modern build pipelines)

```html
<script type="module" src="https://cdn.example.com/rumor-webchat-widget.es.js"></script>
<rumor-webchat-widget></rumor-webchat-widget>
```

### Custom registration

The bundle automatically registers `rumor-webchat-widget` on load. To register the widget under a
custom tag (or tweak defaults) you can call the exposed helper:

```js
window.RumorWebchatWidget.define({
  tagName: 'acme-chat',
  shadowMode: 'open',
  defaults: {
    title: 'Acme Support',
    accentColor: '#ff5722',
    initialOpen: true
  }
});
```

## Attributes & Props

| Attribute        | Type      | Description                                                  |
| ---------------- | --------- | ------------------------------------------------------------ |
| `api-url`        | string    | Backend endpoint the widget will eventually call.            |
| `title`          | string    | Header title text.                                           |
| `accent-color`   | string    | CSS color used for launcher button and message bubbles.      |
| `initial-open`   | boolean   | When present or set to `true`, panel starts in the open state |

All attributes can be updated dynamically; the React tree re-renders in place.

## Project Structure

```
src/
  main.ts                 # Global bootstrap + window API
  types.ts                # Shared widget option types
  widget-element.ts       # Custom element wrapper with Shadow DOM + React root
  widget/
    App.tsx               # Chat UI shell and behavior
    components/           # Header, message list, composer
    styles.css            # Scoped styles injected into the Shadow DOM
examples/
  embed.html              # Manual integration example referencing dist bundle
```

## Next Steps

- Wire `mockResponse` with the actual Rumor backend once the API URL is available.
- Expand accessibility testing (screen readers, keyboard traps) before shipping widely.
- Add automated tests (unit + visual regression) as product requirements evolve.
