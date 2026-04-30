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

export const SCHRODINGER_TOUR_REQUEST_KEY = 'quantum-sim-schrodinger-tour-request';

function TourBeacon(_: BeaconRenderProps) {
	return <span className={styles.beacon} />;
}

export default function SchrodingerTour() {
	const [run, setRun] = useState(false);
	const [steps, setSteps] = useState<Step[]>([]);

	const stepDefinitions = useMemo<TourStepDefinition[]>(
		() => [
			{
				target: '[data-tour="sch-chart"]',
				title: 'Point de départ: que montre ce graphe ?',
				content: (
					<p>
						Ce graphe montre la densité de probabilité de présence de la particule. C’est ici
						que tu observes l’effet de chaque réglage de potentiel.
					</p>
				),
				placement: 'bottom',
			},
			{
				target: '[data-tour="sch-potential-type"]',
				title: '1) Choisir le type de potentiel',
				content: (
					<p>
						Commence par sélectionner le scénario physique: libre ou puits infini. Ce choix
						définit les contraintes imposées à l’onde.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="sch-well-params"]',
				title: '2) Paramètres du puits',
				content: (
					<p>
						Si le puits infini est actif, cette section apparaît. Transition: on passe d’un
						choix de scénario à son réglage géométrique.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="sch-well-width"]',
				title: '3) Largeur du puits',
				content: (
					<p>
						La largeur fixe l’espace disponible pour la particule. Un puits plus étroit change
						fortement les modes stationnaires observés.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="sch-view-mode"]',
				title: '4) Mode de visualisation 2D/3D',
				content: (
					<p>
						Bascule entre 2D et 3D pour changer de point de vue. Le contenu physique est le
						même, mais l’intuition visuelle n’est pas la même.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="sch-numerical-sim"]',
				title: '5) Réglages numériques',
				content: (
					<p>
						Cette partie contrôle la qualité de simulation et la dynamique temporelle. Plus les
						réglages sont fins, plus le calcul est précis mais coûteux.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="sch-time-playback"]',
				title: '6) Lecture temporelle',
				content: (
					<p>
						Lance ou mets en pause l’évolution temporelle pour suivre la propagation étape par
						étape.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="sch-time-steps"]',
				title: '7) Pas de temps',
				content: (
					<p>
						Ce paramètre règle le nombre d’images calculées dans le temps. Plus il est élevé,
						plus l’animation est détaillée.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="sch-spatial-points"]',
				title: '8) Résolution spatiale',
				content: (
					<p>
						Les points spatiaux fixent la finesse de discrétisation en x. Augmenter cette valeur
						améliore la précision mais peut ralentir le calcul.
					</p>
				),
				placement: 'left',
			},
			{
				target: '[data-tour="sch-absorbing-boundaries"]',
				title: '9) Limites absorbantes',
				content: (
					<p>
						Active cette option pour éviter les réflexions artificielles sur les bords du domaine.
						C’est utile pour mieux isoler le phénomène étudié.
					</p>
				),
				placement: 'left',
			},
		],
		[]
	);

	useEffect(() => {
		const shouldStart = window.localStorage.getItem(SCHRODINGER_TOUR_REQUEST_KEY) === '1';
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
				window.localStorage.removeItem(SCHRODINGER_TOUR_REQUEST_KEY);
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
