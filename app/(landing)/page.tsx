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

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const notebookRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [run, setRun] = useState(false);

  useGsapAnimations(heroRef, bentoRef, notebookRef, setIsLoading);

  useEffect(() => {
    if (!isLoading) {
      setRun(true);
    }
  }, [isLoading]);

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