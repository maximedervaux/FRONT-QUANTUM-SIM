import type { Metadata } from "next";
import "./styles/globals.css";
import localFont from 'next/font/local';

const tiltWarp = localFont({
  src: [
    {
      path: './assets/fonts/TiltWarp.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-tilt-warp', 
});

const lato = localFont({
  src: [
    { 
      path : './assets/fonts/Lato/Lato-Regular.ttf', 
      weight: '400', 
      style: 'normal'
    }],
  variable: '--font-lato', 
});


export const metadata: Metadata = {
title: "Quantum Sim",
  description: "Web application designed to demonstrate the capabilities of our Python library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${tiltWarp.variable} ${lato.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
