# @ianalloway/matrix-rain

Matrix-style digital rain animation for React — HiDPI/retina support, auto-pause when tab is hidden, respects `prefers-reduced-motion`. **Zero dependencies.**

[![npm](https://img.shields.io/npm/v/@ianalloway/matrix-rain)](https://www.npmjs.com/package/@ianalloway/matrix-rain)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Zero dependencies](https://img.shields.io/badge/dependencies-zero-16c784)]()

## Install

```bash
npm install @ianalloway/matrix-rain
```

## Usage

```tsx
import MatrixRain from '@ianalloway/matrix-rain';

function App() {
  return (
    <div>
      <MatrixRain />
      <YourContent />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fontSize` | `number` | `13` | Font size in CSS pixels |
| `maxDpr` | `number` | `2` | Device pixel ratio cap (prevents 3x/4x perf cost) |
| `leadColor` | `string` | `'200, 255, 200'` | RGB triplet for lead character |
| `trailColor` | `string` | `'0, 200, 70'` | RGB triplet for trail characters |
| `accentColor` | `string` | `'0, 210, 210'` | RGB triplet for occasional accent |
| `trailFade` | `number` | `0.6` | Trail fade (0..1) |
| `accentProbability` | `number` | `0.03` | Chance of accent color per character |
| `opacity` | `number` | `0.16` | Canvas CSS opacity |
| `className` | `string` | `'matrix-rain'` | CSS class for the canvas |
| `style` | `CSSProperties` | `{}` | Inline style override |
| `respectReducedMotion` | `boolean` | `true` | Honor `prefers-reduced-motion` |
| `maxFps` | `number` | `35` | Frame rate cap |

## Examples

### Custom colors (cyberpunk pink/cyan)

```tsx
<MatrixRain
  leadColor="255, 100, 200"
  trailColor="255, 50, 150"
  accentColor="0, 255, 255"
/>
```

### Behind a hero section

```tsx
<section style={{ position: 'relative' }}>
  <MatrixRain opacity={0.3} />
  <h1>Welcome to the Grid</h1>
</section>
```

### Disable reduced-motion handling (for testing)

```tsx
<MatrixRain respectReducedMotion={false} />
```

## Features

- **HiDPI/retina** — Canvas backing store scales by `devicePixelRatio` (capped at 2x) for crisp rendering on all displays.
- **Battery friendly** — Animation pauses when the tab is hidden, resumes when visible.
- **Accessible** — `aria-hidden="true"` by default. Respects `prefers-reduced-motion`.
- **Performant** — Frame rate capped at 35fps, requestAnimationFrame for smooth animation.
- **Zero dependencies** — Pure React + browser Canvas 2D API.

## Development

```bash
npm install
npm test           # smoke test (vitest)
npm run build      # produces dist/
npm run dev        # watch mode
```

## License

MIT © [Ian Alloway](https://ianalloway.xyz)
