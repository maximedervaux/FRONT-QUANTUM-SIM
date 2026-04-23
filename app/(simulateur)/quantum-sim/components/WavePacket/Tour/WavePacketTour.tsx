'use client';

import { useEffect, useMemo, useState } from 'react';
import { Joyride, type BeaconRenderProps, type Step } from 'react-joyride';

import WaveTourTooltip from '../../Ondes/Tour/WaveTourTooltip';
import styles from '../../Ondes/Tour/WaveTour.module.css';

export const WAVE_PACKET_TOUR_REQUEST_KEY = 'quantum-sim-wave-packet-tour-request';

function TourBeacon(_: BeaconRenderProps) {
	return <span className={styles.beacon} />;
}

export default function WavePacketTour() {
	const [run, setRun] = useState(false);

	const steps = useMemo<Step[]>(
		() =>
			[
				{
					target: '[data-tour="packet-header"]',
					title: 'Le paquet d’ondes',
					content: (
						<p>
							Bienvenue dans le mode paquet d’ondes. Cette section te permet d’explorer
							la superposition d’ondes planes et son évolution temporelle.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-type"]',
					title: 'Choisir le type de paquet',
					content: (
						<p>
							Ici, tu sélectionnes la structure du paquet : gaussien, aléatoire ou
							personnalisé selon l’expérience que tu veux faire.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-presets"]',
					title: 'Présets rapides',
					content: (
						<p>
							Les présets appliquent instantanément des configurations utiles pour
							comparer paquet standard, étroit et large.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-composition"]',
					title: 'Composition en ondes planes',
					content: (
						<p>
							Ce curseur contrôle le nombre d’ondes composantes. Plus la base est riche,
							plus la représentation du paquet est fine.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-time-controls"]',
					title: 'Animation temporelle',
					content: (
						<p>
							Lecture, pause et réinitialisation servent à observer la propagation du paquet dans
							le temps et comparer les régimes.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-visualization"]',
					title: 'Mode d’affichage',
					content: (
						<p>
							Bascule entre la fonction d’onde et la densité de probabilité pour
							changer de point de vue physique.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-window"]',
					title: 'Fenêtre spatiale',
					content: (
						<p>
							Ajuste x min et x max pour cadrer proprement la zone d’étude et stabiliser
							la lecture du signal.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-chart"]',
					title: 'Visualiseur du paquet',
					content: (
						<p>
							Le graphe reflète instantanément tes réglages. C’est ici que tu vérifies
							l’effet des paramètres sur la forme et la propagation.
						</p>
					),
					placement: 'auto',
				},
			].map(step => ({ ...step, skipBeacon: true })),
		[]
	);

	useEffect(() => {
		const shouldStart = window.localStorage.getItem(WAVE_PACKET_TOUR_REQUEST_KEY) === '1';
		if (!shouldStart) return;

		let cancelled = false;
		let attempts = 0;
		const maxAttempts = 30;

		const startWhenReady = () => {
			if (cancelled) return;

			const firstTarget = document.querySelector('[data-tour="packet-header"]');
			if (firstTarget) {
				window.localStorage.removeItem(WAVE_PACKET_TOUR_REQUEST_KEY);
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

	return (
		<Joyride
			beaconComponent={TourBeacon}
			callback={data => {
				if (data.status === 'finished' || data.status === 'skipped') {
					setRun(false);
				}
			}}
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
	);
}