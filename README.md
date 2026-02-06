This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


```
FRONT-QUANTUM-SIM
├─ .DS_Store
├─ README.md
├─ app
│  ├─ (landing)
│  │  ├─ components
│  │  │  ├─ Bento.tsx
│  │  │  └─ CodeButton.tsx
│  │  ├─ page.tsx
│  │  └─ styles
│  │     └─ style.css
│  ├─ (simulateur)
│  │  ├─ core
│  │  │  ├─ controllers
│  │  │  │  └─ mainController.jsx
│  │  │  └─ workers
│  │  │     └─ mainWorker.js
│  │  └─ quantum-sim
│  │     ├─ components
│  │     │  └─ MenuBar
│  │     │     ├─ MenuBar.module.css
│  │     │     └─ MenuBar.tsx
│  │     ├─ favicon.ico
│  │     ├─ hooks
│  │     ├─ page.tsx
│  │     ├─ store
│  │     │  └─ navigation.store.tsx
│  │     └─ styles
│  │        └─ style.css
│  ├─ .DS_Store
│  ├─ assets
│  │  ├─ .DS_Store
│  │  └─ fonts
│  │     ├─ .DS_Store
│  │     ├─ Lato
│  │     │  ├─ Lato-Black.ttf
│  │     │  ├─ Lato-BlackItalic.ttf
│  │     │  ├─ Lato-Bold.ttf
│  │     │  ├─ Lato-BoldItalic.ttf
│  │     │  ├─ Lato-Italic.ttf
│  │     │  ├─ Lato-Light.ttf
│  │     │  ├─ Lato-LightItalic.ttf
│  │     │  ├─ Lato-Regular.ttf
│  │     │  ├─ Lato-Thin.ttf
│  │     │  ├─ Lato-ThinItalic.ttf
│  │     │  └─ OFL.txt
│  │     └─ TiltWarp.ttf
│  └─ styles
│     └─ globals.css
├─ components
│  └─ ui
│     ├─ button.tsx
│     ├─ card.tsx
│     ├─ menubar.tsx
│     └─ tabs.tsx
├─ components.json
├─ eslint.config.mjs
├─ lib
│  └─ utils.ts
├─ next-env.d.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ Hero.png
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ logo.png
│  ├─ next.svg
│  ├─ notebook.png
│  ├─ onde.png
│  ├─ python
│  │  └─ main.py
│  ├─ vercel.svg
│  ├─ waves.jpg
│  └─ window.svg
└─ tsconfig.json

```