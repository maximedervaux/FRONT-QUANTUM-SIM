'use client';

import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
	EVENTS,
	Joyride,
	STATUS,
	type BeaconRenderProps,
	type CallBackProps,
	type Step,
} from 'react-joyride';

import { useWaveStore } from '../../../store/onde.store';
import WaveTourTooltip from './WaveTourTooltip';
import styles from './WaveTour.module.css';

export const WAVE_TOUR_REQUEST_KEY = 'quantum-sim-wave-tour-request';
const HARMONICS_DRAWER_STEP = 7;

const TourBeacon = forwardRef<HTMLSpanElement, BeaconRenderProps>(function TourBeacon(_, ref) {
	return <span ref={ref} className={styles.beacon} />;
});

export default function WaveTour() {
	const [run, setRun] = useState(false);
	const { isHarmonicsDrawerOpen, setHarmonicsDrawerOpen } = useWaveStore();

	const steps = useMemo<Step[]>(
		() =>
			[
			{
				target: '[data-tour="wave-equation"]',
				title: 'La fonction d’onde',
				content: (
					<p>
						Cette formule est le point de départ du module ondes. Elle te donne la structure
						mathématique de ce que tu observes dans le visualiseur.
					</p>
				),
				placement: 'bottom',
			},
			{
				target: '[data-tour="equation-live-toggle"]',
				title: 'Valeurs en temps réel',
				content: (
					<p>
						Ici, tu peux basculer entre l’écriture symbolique et les valeurs numériques mises à
						jour en direct. C’est la meilleure façon de voir l’impact immédiat des réglages.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="wave-visualizer"]',
				title: 'Le visualiseur',
				content: (
					<p>
						Le graphe traduit l’onde en représentation visuelle. Chaque paramètre modifie ce
						tracé, ce qui te permet d’explorer la dynamique sans quitter l’écran.
					</p>
				),
				placement: 'auto',
			},
			{
				target: '[data-tour="wave-function-select"]',
				title: 'Choisir une onde gaussienne',
				content: (
					<p>
						Commence ici pour choisir la famille d’onde. Pour ce parcours, la gaussienne sert
						de base pédagogique car elle met bien en évidence les variations de forme.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="wave-period"]',
				title: 'Régler la période',
				content: (
					<p>
						La période contrôle la vitesse de répétition de l’oscillation. En la changeant, tu
						modifies le rythme global de l’onde visible dans le visualiseur.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="wave-number"]',
				title: 'Ajuster le nombre d’onde',
				content: (
					<p>
						Le nombre d’onde agit directement sur la densité spatiale des oscillations. C’est un
						paramètre fondamental pour comprendre la fréquence spatiale du signal.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="wave-harmonics"]',
				title: 'Construire une onde plus riche',
				content: (
					<p>
						Le nombre d’harmoniques détermine combien de composantes fréquentielles sont
						superposées. Plus tu en ajoutes, plus la forme de l’onde peut devenir complexe.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="harmonics-drawer"]',
				title: 'Affiner chaque harmonique',
				content: (
					<p>
						Cette fenêtre avancée te permet de régler amplitude par amplitude. C’est ici que tu
						passes d’une exploration globale à une sculpture fine de la forme d’onde.
					</p>
				),
				placement: 'top',
			},
			{
				target: '[data-tour="wave-time-controls"]',
				title: 'Observer l’évolution temporelle',
				content: (
					<p>
						Lecture, pause et réinitialisation te permettent de voir l’onde évoluer dans le temps.
						Tu peux ainsi relier la formule, les paramètres et le mouvement observé.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="wave-visual-options"]',
				title: 'Faire évoluer la visualisation',
				content: (
					<p>
						Termine ici pour changer le mode d’affichage, afficher la partie imaginaire et comparer
						les effets de tous les paramètres. Toute la section ondes est faite pour cette boucle
						d’essais visuels.
					</p>
				),
				placement: 'left',
			},
			].map(step => ({ ...step, skipBeacon: true })),
		[]
	);

	useEffect(() => {
		const shouldStart = window.localStorage.getItem(WAVE_TOUR_REQUEST_KEY) === '1';
		if (!shouldStart) return;

		let cancelled = false;
		let attempts = 0;
		const maxAttempts = 30;

		const startWhenReady = () => {
			if (cancelled) return;

			const firstTarget = document.querySelector('[data-tour="wave-equation"]');
			if (firstTarget) {
				window.localStorage.removeItem(WAVE_TOUR_REQUEST_KEY);
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
	}, []);

	const closeGuide = useCallback(() => {
		setRun(false);
		setHarmonicsDrawerOpen(false);
	}, [setHarmonicsDrawerOpen]);

	const handleJoyrideCallback = useCallback(
		(data: CallBackProps) => {
			const { index, status, type } = data;

			if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
				closeGuide();
				return;
			}

			if (type === EVENTS.STEP_BEFORE) {
				if (index === HARMONICS_DRAWER_STEP) {
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
				callback={handleJoyrideCallback}
				continuous
				disableCloseOnEsc={false}
				disableOverlayClose
				floaterProps={{
					offset: 18,
					styles: {
						arrow: {
							color: '#ffffff',
						},
					},
				}}
				hideCloseButton
				locale={{
					back: 'Retour',
					close: 'Fermer',
					last: 'Terminer',
					next: 'Suivant',
					nextWithProgress: 'Suivant ({current}/{total})',
					skip: 'Passer',
				}}
				run={run}
				scrollOffset={96}
				scrollToFirstStep
				showProgress
				showSkipButton
				spotlightClicks
				steps={steps}
				styles={{
					options: {
						arrowColor: '#ffffff',
						backgroundColor: '#ffffff',
						overlayColor: 'rgba(15, 23, 42, 0.42)',
						primaryColor: '#0f172a',
						spotlightShadow: '0 0 0 12px rgba(255, 255, 255, 0.18)',
						textColor: '#0f172a',
						zIndex: 1200,
					},
				}}
				tooltipComponent={WaveTourTooltip}
			/>
		</>
	);
}