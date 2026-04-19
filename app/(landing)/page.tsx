"use client";

import { useRef, useState, useEffect } from "react";
import styles from './styles/style.module.css';
import Bento from "./components/Bento/Bento";
import Hero from "./components/Hero/Hero";
import Notebook from "./components/Notebook/Notebook";
import TechStack from "./components/TechStack/TechStack";
import TeamSection from "./components/TeamSection/TeamSection";
import { useGsapAnimations } from "./hooks/useGsapAnimation";
import { useJoyride } from 'react-joyride';

const steps = [
  {
    target: '[data-tour="logo"]',
    content: 'This is our project. It allows you to simulate quantum systems easily.',
    title: 'Welcome',
  },
  {
    target: '[data-tour="cta"]',
    content: 'All simulations are launched from here. This is your main entry point.',
    title: 'Start simulations',
  },
  {
    target: '[data-tour="description"]',
    content: 'You can also install our Python package and run simulations directly in your notebook without any setup complexity.',
    title: 'Python package',
  },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const notebookRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [run, setRun] = useState(false);

  const { controls, on, Tour } = useJoyride({
    continuous: true,
    debug: true,
    steps,
    run,

    onEvent: (data) => {
      // scroll manuel stable (important avec GSAP)
      if (data.type === 'step:before') {
        const el = document.querySelector(data.step.target as string);

        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }

      if (data.type === 'tour:end' || data.type === 'tour:status') {
        if (data.status === 'finished' || data.status === 'skipped') {
          setRun(false);
        }
      }
    },

    options: {
      buttons: ['back', 'close', 'primary', 'skip'],
      scrollOffset: 64,
      showProgress: true,
      skipScroll: true, // 🔥 IMPORTANT
      spotlightPadding: 16,
      spotlightRadius: 16,
    },
  });

  useGsapAnimations(heroRef, bentoRef, notebookRef, setIsLoading);

  useEffect(() => {
    if (!isLoading) {
      setRun(true);
    }
  }, [isLoading]);

  // reset propre
  useEffect(() => {
    on('tour:end', () => {
      controls.reset();
      setRun(false);
    });
  }, [controls, on]);

  return (
    <div className={styles.containerLanding}>
      <Hero ref={heroRef}/>
      <Bento  ref={bentoRef}/>
      <Notebook ref={notebookRef}/>
      <TechStack />
      <TeamSection />
      
    </div>
  );
}