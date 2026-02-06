"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import './styles/style.css'
import BentoGrid from "./components/Bento";
import CodeButton from "./components/CodeButton";
import { Toaster } from "sonner";
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const notebookRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    // Loading animation
    const tl = gsap.timeline({
      onComplete: () => setIsLoading(false),
    });

  

    // Hero animation after loader
    tl.fromTo(
      heroRef.current,
      { opacity: 0, y: -80 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );

    tl.fromTo(
      ".hero .left h1",
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" },
      "-=0.6"
    );

    tl.fromTo(
      ".hero .right",
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" },
      "-=0.6"
    );

    // Bento Grid scroll animation
    gsap.fromTo(
      bentoRef.current,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: bentoRef.current,
          start: "top 80%",
          end: "top 50%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Notebook section scroll animation
    gsap.fromTo(
      notebookRef.current,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: notebookRef.current,
          start: "top 80%",
          end: "top 50%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Notebook image animation
    gsap.fromTo(
      ".notebook img",
      { opacity: 0, scale: 0.8, x: -50 },
      {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: notebookRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Notebook text animation
    gsap.fromTo(
      ".notebook .text",
      { opacity: 0, x: 50 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: notebookRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);



  return (
    <div className="containerLanding">
   
      {/* HERO */}
      <div className="hero" ref={heroRef}>
        <div className="left">
          <h1>Quantum SIM</h1>
        </div>

        <div className="right">
          <Link href="/quantum-sim" className="startButton">
              Lancer la simulation
           </Link>
        </div>
      </div>
     
      {/* BENTO GRID */}
        <BentoGrid />

      {/* NOTEBOOK SECTION */}
      <div className="notebook" ref={notebookRef}>
        <img
          src="/notebook.png"
          alt="notebook"
          width={800}
          height={600}
        />

        <div className="text">
          <h2>Installe notre librairie directement sur ton notebook !</h2>
          <p>
            Installe notre librairie en une seule commande et commence immédiatement
            à simuler des systèmes quantiques depuis ton notebook. Elle s’intègre
            sans configuration complexe et te permet de passer rapidement de
            l’installation à l’expérimentation. Que ce soit pour l’enseignement,
            la recherche ou le prototypage, tout est prêt pour exécuter tes premières
            simulations en quelques minutes.
          </p>
          <br />
          <CodeButton />
          <Toaster />
          
        </div>
            

      </div>
    </div>
  );
}