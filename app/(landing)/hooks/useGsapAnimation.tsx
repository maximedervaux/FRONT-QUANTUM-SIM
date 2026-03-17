'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

//TODO: Controler pourquoi le gsap n'arrive pas à détecter les éléments basés sur leur classe
// -> Génére des warnings en console
// Solutions possibles :
// 1. Faire en sorte qu'il applique les animations aux éléments depuis les classes
// 2. Supprimer les appels qui générent des warnings
// 3. (Pas ouf) Set l'attribut nullTargetWarn à false dans gsap.config()
export function useGsapAnimations(
	heroRef: React.RefObject<HTMLDivElement | null>,
	bentoRef: React.RefObject<HTMLDivElement | null>,
	notebookRef: React.RefObject<HTMLDivElement | null>,
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
	useEffect(() => {
		if (!heroRef.current || !bentoRef.current || !notebookRef.current) return;

		const tl = gsap.timeline({
			onComplete: () => setIsLoading(false),
		});

		// Hero
		tl.fromTo(
			heroRef.current,
			{ opacity: 0, y: -80 },
			{ opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
		);
		tl.fromTo(
			'.hero .left h1',
			{ opacity: 0, x: '-10%' },
			{ opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' },
			'-=0.6'
		);
		tl.fromTo(
			'.hero .right',
			{ opacity: 0, x: '10%' },
			{ opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' },
			'-=0.6'
		);

		// Bento
		gsap.fromTo(
			bentoRef.current,
			{ opacity: 0, y: 100 },
			{
				opacity: 1,
				y: 0,
				duration: 1,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: bentoRef.current,
					start: 'top 80%',
					end: 'top 50%',
					toggleActions: 'play none none reverse',
				},
			}
		);

		// Notebook
		gsap.fromTo(
			notebookRef.current,
			{ opacity: 0, y: 100 },
			{
				opacity: 1,
				y: 0,
				duration: 1,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: notebookRef.current,
					start: 'top 80%',
					end: 'top 50%',
					toggleActions: 'play none none reverse',
				},
			}
		);

		// Notebook children
		gsap.fromTo(
			'.notebook img',
			{ opacity: 0, scale: 0.8, x: '-10%' },
			{
				opacity: 1,
				scale: 1,
				x: 0,
				duration: 1,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: notebookRef.current,
					start: 'top 70%',
				},
			}
		);
		gsap.fromTo(
			'.notebook .text',
			{ opacity: 0, x: '10%' },
			{
				opacity: 1,
				x: 0,
				duration: 1,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: notebookRef.current,
					start: 'top 70%',
				},
			}
		);

		return () => {
			ScrollTrigger.getAll().forEach(t => t.kill());
		};
	}, [heroRef, bentoRef, notebookRef, setIsLoading]);
}
