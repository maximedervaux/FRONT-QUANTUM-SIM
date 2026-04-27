'use client';

import { useEffect, useMemo, useState } from 'react';
import { EVENTS, Joyride, STATUS, type BeaconRenderProps, type EventData, type Step } from 'react-joyride';

import {
	getExistingStepDefinitions,
	toJoyrideSteps,
	type TourStepDefinition,
} from '../../shared/Tour/tourSteps';
import WaveTourTooltip from '../../Ondes/Tour/WaveTourTooltip';
import styles from '../../Ondes/Tour/WaveTour.module.css';

export const WAVE_PACKET_TOUR_REQUEST_KEY = 'quantum-sim-wave-packet-tour-request';

function TourBeacon(_: BeaconRenderProps) {
	return <span className={styles.beacon} />;
}

export default function WavePacketTour() {
	const [run, setRun] = useState(false);
	const [steps, setSteps] = useState<Step[]>([]);

	const stepDefinitions = useMemo<TourStepDefinition[]>(
		() =>
			[
				{
					target: '[data-tour="packet-header"]',
					title: 'Point de départ: le paquet d’ondes',
					content: (
						<p>
							Ici, on construit une onde localisée en superposant plusieurs ondes planes.
							Tu vas voir comment chaque réglage influence sa forme.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-type"]',
					title: '1) Choisir le type de paquet',
					content: (
						<p>
							Gaussien, aléatoire ou personnalisé: ce choix fixe la logique de construction du
							paquet avant les réglages fins.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-presets"]',
					title: '2) Tester des présets',
					content: (
						<p>
							Les présets chargent des cas utiles (standard, étroit, large). C’est la façon la
							plus rapide de comparer la dispersion.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-gaussian-params"]',
					title: '3) Paramètres gaussiens (vue d’ensemble)',
					content: (
						<p>
							Transition: maintenant on affine le paquet gaussien avec trois paramètres clés:
							k₀, Δk et x₀.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-k-center"]',
					title: '4) Vecteur d’onde central k₀',
					content: (
						<p>
							k₀ règle l’oscillation dominante: il influence la structure interne des franges du
							paquet.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-sigma-k"]',
					title: '5) Largeur spectrale Δk',
					content: (
						<p>
							Δk contrôle l’étalement en nombre d’onde. En pratique, il joue sur la localisation
							spatiale du paquet.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-x-center"]',
					title: '6) Position centrale x₀',
					content: (
						<p>
							x₀ déplace le paquet dans l’espace. Idéal pour observer la propagation depuis une
							position initiale différente.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-composition"]',
					title: '7) Composition en ondes planes',
					content: (
						<p>
							Ce curseur fixe combien d’ondes sont superposées. Plus il est élevé, plus le paquet
							est reconstruit finement.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-visualization"]',
					title: '8) Changer de point de vue',
					content: (
						<p>
							Passe de la fonction d’onde à la densité de probabilité (ou la phase) pour relier
							lecture mathématique et interprétation physique.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-window"]',
					title: '9) Ajuster la fenêtre spatiale',
					content: (
						<p>
							Régle x min / x max pour cadrer ta zone d’étude et garder une lecture stable du
							signal.
						</p>
					),
					placement: 'left',
				},
				{
					target: '[data-tour="packet-chart"]',
					title: '10) Vérification finale dans le graphe',
					content: (
						<p>
							Le graphe résume l’effet de tous les paramètres. Fais varier un réglage à la fois
							pour construire ton intuition pas à pas.
						</p>
					),
					placement: 'auto',
				},
			],
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

			const availableSteps = getExistingStepDefinitions(stepDefinitions);
			const firstTarget = availableSteps[0]?.target;

			if (firstTarget) {
				setSteps(toJoyrideSteps(availableSteps));
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
	}, [stepDefinitions]);

	return (
		<Joyride
			beaconComponent={TourBeacon}
			onEvent={(data: EventData) => {
				if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
					setRun(false);
					return;
				}

				if (data.type === EVENTS.TOUR_END) {
					setRun(false);
				}
			}}
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
	);
}