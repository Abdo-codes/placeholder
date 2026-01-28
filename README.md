# Placeholder Image Generator

A React web app for generating custom placeholder images with specific dimensions.

## Features

- Custom width and height (1-4096px)
- Preset sizes for common use cases (HD, Instagram, Twitter, YouTube, etc.)
- Pattern backgrounds (solid, gradient, radial, stripes, dots, grid, noise)
- Customizable colors
- Border radius and border width controls
- Aspect ratio lock
- Optional custom text overlay
- Export as PNG, JPG, or SVG
- Batch download multiple sizes at once
- Copy image or data URL to clipboard

## Local Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
git clone https://github.com/Abdo-codes/placeholder.git
cd placeholder
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with static files ready for deployment.

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

1. Push to GitHub
2. Connect repo in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Deploy to GitHub Pages

```bash
npm run build
```

Then push the `dist` folder to `gh-pages` branch or configure GitHub Actions.

## Tech Stack

- React 18
- Vite
- Canvas API
