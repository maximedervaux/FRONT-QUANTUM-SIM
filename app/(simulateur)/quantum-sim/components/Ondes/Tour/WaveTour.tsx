'use client';

import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
	EVENTS,
	Joyride,
	STATUS,
	type BeaconRenderProps,
	type EventData,
	type Step,
} from 'react-joyride';

import {
	getExistingStepDefinitions,
	toJoyrideSteps,
	type TourStepDefinition,
} from '../../shared/Tour/tourSteps';
import { useWaveStore } from '../../../store/onde.store';
import WaveTourTooltip from './WaveTourTooltip';
import styles from './WaveTour.module.css';

export const WAVE_TOUR_REQUEST_KEY = 'quantum-sim-wave-tour-request';
export const WAVE_TOUR_SEEN_COOKIE = 'quantum-sim-wave-tour-seen';
const WAVE_TOUR_SEEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const HARMONICS_DRAWER_TARGET = '[data-tour="harmonics-drawer"]';

function hasCookie(cookieName: string): boolean {
	return document.cookie.split('; ').some(cookie => cookie.startsWith(`${cookieName}=`));
}

function setSeenCookie(cookieName: string): void {
	document.cookie = `${cookieName}=1; path=/; max-age=${WAVE_TOUR_SEEN_COOKIE_MAX_AGE}; SameSite=Lax`;
}

const TourBeacon = forwardRef<HTMLSpanElement, BeaconRenderProps>(function TourBeacon(_, ref) {
	return <span ref={ref} className={styles.beacon} />;
});

export default function WaveTour() {
	const [run, setRun] = useState(false);
	const [steps, setSteps] = useState<Step[]>([]);
	const { isHarmonicsDrawerOpen, setHarmonicsDrawerOpen } = useWaveStore();

	const stepDefinitions = useMemo<TourStepDefinition[]>(
		() => [
			{
				target: '[data-tour="wave-equation"]',
				title: 'Point de départ: la fonction d’onde',
				content: (
					<p>
						Cette formule décrit l’onde que tu vas manipuler. Pense-la comme la recette qui produit
						la courbe affichée dans le graphe.
					</p>
				),
				placement: 'bottom',
			},
			{
				target: '[data-tour="equation-live-toggle"]',
				title: 'Lire la formule en direct',
				content: (
					<p>
						Ici, tu alternes entre écriture symbolique et valeurs numériques. Pratique pour
						comprendre immédiatement l’effet d’un réglage.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="wave-visualizer"]',
				title: 'Observer l’onde',
				content: (
					<p>
						Le graphe montre la forme de l’onde. À partir de maintenant, chaque paramètre que tu
						changes aura un effet visible ici.
					</p>
				),
				placement: 'auto',
			},
			{
				target: '[data-tour="wave-function-select"]',
				title: '1) Choisir la famille d’onde',
				content: (
					<p>
						Commence par le type d’onde (sinusoïde ou gaussienne). C’est le réglage global qui donne
						la forme de base du signal.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="wave-window"]',
				title: '2) Définir la fenêtre spatiale',
				content: (
					<p>
						Ces bornes définissent la zone x min / x max affichée. Un bon cadrage aide à mieux lire
						la forme de l’onde et ses variations.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="wave-number"]',
				title: '3) Régler le nombre d’onde k',
				content: (
					<p>
						Le nombre d’onde contrôle la densité des oscillations dans l’espace. Plus k augmente,
						plus les bosses et creux se resserrent.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="wave-harmonics"]',
				title: '4) Enrichir avec des harmoniques',
				content: (
					<p>
						Ici, tu règles combien de composantes fréquentielles sont superposées. En ajouter permet
						de construire des formes d’onde plus riches.
					</p>
				),
				placement: 'left',
			},
			{
				target: HARMONICS_DRAWER_TARGET,
				title: '5) Ajuster amplitude par amplitude',
				content: (
					<p>
						Dans ce panneau, tu ajustes chaque harmonique séparément. C’est la partie la plus fine
						du réglage, idéale pour comprendre la superposition.
					</p>
				),
				placement: 'top',
			},
			{
				target: '[data-tour="wave-time-controls"]',
				title: '6) Faire évoluer l’onde dans le temps',
				content: (
					<p>
						Lecture, pause et reset te permettent de suivre la dynamique temporelle. Transition: on
						passe maintenant de la forme statique au comportement dans le temps.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="wave-visual-options"]',
				title: '7) Comparer les modes de visualisation',
				content: (
					<p>
						Termine en testant 2D/3D et la partie imaginaire. Tu relieras ainsi paramètres,
						représentation visuelle et intuition physique en un seul coup d’œil.
					</p>
				),
				placement: 'left',
			},
		],
		[]
	);

	useEffect(() => {
		const shouldStartFromButton = window.localStorage.getItem(WAVE_TOUR_REQUEST_KEY) === '1';
		const shouldStartAutomatically = !hasCookie(WAVE_TOUR_SEEN_COOKIE);

		if (!shouldStartFromButton && !shouldStartAutomatically) return;

		let cancelled = false;
		let attempts = 0;
		const maxAttempts = 30;

		const startWhenReady = () => {
			if (cancelled) return;

			const availableSteps = getExistingStepDefinitions(stepDefinitions);
			const firstTarget = availableSteps[0]?.target;

			if (firstTarget) {
				setSteps(toJoyrideSteps(availableSteps));
				if (shouldStartFromButton) {
					window.localStorage.removeItem(WAVE_TOUR_REQUEST_KEY);
				}
				setSeenCookie(WAVE_TOUR_SEEN_COOKIE);
				setRun(true);
				return;
			}

			attempts += 1;
			if (attempts < maxAttempts) {
				window.setTimeout(startWhenReady, 120);
			}
		};

		const timer = window.setTimeout(startWhenReady, 120);

		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [stepDefinitions]);

	const closeGuide = useCallback(() => {
		setRun(false);
		setHarmonicsDrawerOpen(false);
	}, [setHarmonicsDrawerOpen]);

	const handleJoyrideCallback = useCallback(
		(data: EventData) => {
			const { status, type } = data;
			const currentTarget = typeof data.step?.target === 'string' ? data.step.target : null;

			if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
				closeGuide();
				return;
			}

			if (type === EVENTS.STEP_BEFORE) {
				if (currentTarget === HARMONICS_DRAWER_TARGET) {
					setHarmonicsDrawerOpen(true);
				} else if (isHarmonicsDrawerOpen) {
					setHarmonicsDrawerOpen(false);
				}
			}
		},
		[closeGuide, isHarmonicsDrawerOpen, setHarmonicsDrawerOpen]
	);

	return (
		<>
			<Joyride
				beaconComponent={TourBeacon}
				onEvent={handleJoyrideCallback}
				continuous
				locale={{
					back: 'Retour',
					close: 'Fermer',
					last: 'Terminer',
					next: 'Suivant',
					nextWithProgress: 'Suivant ({current}/{total})',
					skip: 'Passer',
				}}
				run={run}
				scrollToFirstStep
				steps={steps}
				options={{
					arrowSpacing: 18,
					arrowColor: '#ffffff',
					backgroundColor: '#ffffff',
					overlayClickAction: false,
					overlayColor: 'rgba(15, 23, 42, 0.42)',
					primaryColor: '#0f172a',
					scrollOffset: 96,
					showProgress: true,
					spotlightPadding: 0,
					blockTargetInteraction: false,
					textColor: '#0f172a',
					zIndex: 1200,
				}}
				tooltipComponent={WaveTourTooltip}
			/>
		</>
	);
}
