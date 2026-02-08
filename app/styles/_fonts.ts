import localFont from 'next/font/local';

export const tiltWarp = localFont({
  src: [{ path: './assets/fonts/TiltWarp.ttf', weight: '400', style: 'normal' }],
  variable: '--font-tilt-warp',
  display: 'swap',
});

export const lato = localFont({
  src: [{ path : './assets/fonts/Lato/Lato-Regular.ttf', weight: '400', style: 'normal' }],
  variable: '--font-lato',
  display: 'swap',
});

