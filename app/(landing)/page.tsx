"use client";

import { useRef, useState } from "react";
import styles from './styles/style.module.css';
import Bento from "./components/Bento/Bento";
import Hero from "./components/Hero/Hero";
import Notebook from "./components/Notebook/Notebook";
import TechStack from "./components/TechStack/TechStack";
import { useGsapAnimations } from "./hooks/useGsapAnimation";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const notebookRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useGsapAnimations(heroRef, bentoRef, notebookRef, setIsLoading);

  return (
    <div className={styles.containerLanding}>
      <Hero ref={heroRef}/>
      <Bento  ref={bentoRef}/>
      <Notebook ref={notebookRef}/>
      <TechStack />
      
    </div>
  );
}