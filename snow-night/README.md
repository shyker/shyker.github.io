# Snow Night Street

Vite + React + Three.js + GSAP front-end showcase for a 16:9 snowy Japanese night street scene.

## Run

```bash
npm run snow:dev
```

Open `http://localhost:5174`.

## Build

```bash
npm run snow:build
```

The static build is written to `dist/snow-night`.

## Remotion

Preview the exportable video composition:

```bash
npm run remotion:preview
```

Render the 12 second 1920x1080 video:

```bash
npm run remotion:render
```

The default render path is `video/snow-night.mp4`.

## Assets

Generated assets live in `public/snow-night/assets`:

- `background-source.png`
- `ghosts.png`
- `glow-fog.png`
- `snow-particles.png`
- `road-texture.png`

The `*-key.png` files are the original chroma-key Imagegen outputs kept for iteration.
