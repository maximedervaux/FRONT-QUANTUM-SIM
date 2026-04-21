import Chart from '../Ondes/2DChart/Chart';
import ThreeChart from '../Ondes/3DChart/ThreeChart';
import styles from './DashBoard.module.css';
import Parametre from '../Ondes/Parametre/Parametre';
import { useNavigationStore } from '../../store/navigation.store';
import Equation from '../Ondes/Equation/Equation';
import { usePythonWorker } from '../../../core/contexts/PythonWorkerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpenText, Cpu, FlaskConical, Gauge, Play } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useWaveStore } from '../../store/onde.store';
import HarmonicsDrawer from '../Ondes/HarmonicsDrawer/HarmonicsDrawer';
import ParametreWavePacket from '../WavePacket/WavePacketParametre/WavePacketParametre';
import ChartWavePacket from '../WavePacket/ChartWavePacket/ChartWavePacket';
import PythonEngineLoader from '../Loader/PythonEngineLoader'
import WaveTour, { WAVE_TOUR_REQUEST_KEY, WAVE_TOUR_SEEN_COOKIE } from '../Ondes/Tour/WaveTour';
import WavePacketTour, { WAVE_PACKET_TOUR_REQUEST_KEY } from '../WavePacket/Tour/WavePacketTour';


export default function DashBoard() {
	const { activePage, setActivePage } = useNavigationStore();
	const {
		harmonics,
		waveNumber,
		period,
		time,
		isAnimatingTime,
		viewMode,
		setFunction,
		setWaveNumber,
		setPeriod,
		setHarmonics,
		resetPhase,
		resetTime,
		toggleAnimationTime,
	} = useWaveStore();
	const { isReady, loadedScripts } = usePythonWorker();

	const [isFirstVisit, setIsFirstVisit] = useState(true);
	const [lastSnapshot, setLastSnapshot] = useState<null | {
		waveNumber: number;
		period: number;
		harmonics: number;
		time: number;
	}>(null);

	useEffect(() => {
		const snapshotKey = 'quantum-sim-last-snapshot';
		const hasSeenWaveTour = document.cookie
			.split('; ')
			.some(cookie => cookie.startsWith(`${WAVE_TOUR_SEEN_COOKIE}=`));

		setIsFirstVisit(!hasSeenWaveTour);

		if (!hasSeenWaveTour) {
			window.localStorage.setItem(WAVE_TOUR_REQUEST_KEY, '1');
			setActivePage('ondes');
		}

		const rawSnapshot = localStorage.getItem(snapshotKey);
		if (!rawSnapshot) return;

		try {
			const parsed = JSON.parse(rawSnapshot) as {
				waveNumber: number;
				period: number;
				harmonics: number;
				time: number;
			};
			setLastSnapshot(parsed);
		} catch {
			setLastSnapshot(null);
		}
	}, [setActivePage]);

	useEffect(() => {
		const snapshot = {
			waveNumber,
			period,
			harmonics,
			time,
		};

		localStorage.setItem('quantum-sim-last-snapshot', JSON.stringify(snapshot));
		setLastSnapshot(snapshot);
	}, [waveNumber, period, harmonics, time]);

	const workerProgress = useMemo(() => {
		if (!isReady) return 35;
		return 100;
	}, [isReady, loadedScripts.size]);

	const runDefaultWave = () => {
		if (isAnimatingTime) {
			toggleAnimationTime();
		}
		resetPhase();
		resetTime();
		setFunction('sinusoidale');
		setWaveNumber(6);
		setPeriod(12);
		setHarmonics(1);
		setActivePage('ondes');
	};

	const openWaveSettings = () => {
		setActivePage('ondes');
	};

	const resetSimulation = () => {
		if (isAnimatingTime) {
			toggleAnimationTime();
		}
		resetPhase();
		resetTime();
	};

	const launchWaveTutorial = () => {
		window.localStorage.setItem(WAVE_TOUR_REQUEST_KEY, '1');
		setActivePage('ondes');
	};

	const launchWavePacketTutorial = () => {
		window.localStorage.setItem(WAVE_PACKET_TOUR_REQUEST_KEY, '1');
		setActivePage('packets');
	};

	if (!isReady) {
		return <PythonEngineLoader />
	}

	return (
		<div className={styles.dashboard}>
			<div className={styles.chartsContainer}>
				{activePage === 'default' && (
					<>
						<Card className={styles.heroCard}>
							<CardHeader>
								<CardTitle className={styles.cardTitle}>
									<FlaskConical />
									{isFirstVisit ? 'Bienvenue dans Quantum Sim' : 'Prêt à continuer'}
								</CardTitle>
								<CardDescription>
									{isFirstVisit
										? 'Lance une simulation d’onde en un clic et ajuste les paramètres ensuite.'
										: 'Reprends rapidement ta dernière configuration ou relance une onde de base.'}
								</CardDescription>
							</CardHeader>
							<CardContent className={styles.heroActions}>
								<Button onClick={runDefaultWave}>
									<Play data-icon="inline-start" />
									Lancer une onde par défaut
								</Button>
								<Button onClick={openWaveSettings} variant="outline">
									<Gauge data-icon="inline-start" />
									Ouvrir les paramètres
								</Button>
							</CardContent>
						</Card>

						<Card className={styles.tutorialCard}>
							<CardHeader>
								<CardTitle className={styles.cardTitle}>
									<BookOpenText />
									Faire le tour complet de la section ondes
								</CardTitle>
								<CardDescription>
									Démarre un tutoriel guidé en 10 étapes pour comprendre la formule,
									le visualiseur et les paramètres fondamentaux.
								</CardDescription>
							</CardHeader>
							<CardContent className={styles.heroActions}>
								<Button onClick={launchWaveTutorial}>
									<BookOpenText data-icon="inline-start" />
									Lancer le tutoriel ondes
								</Button>
							</CardContent>
						</Card>

						<Card className={styles.statusCard}>
							<CardHeader>
								<CardTitle className={styles.cardTitle}>
									<Cpu />
									Statut moteur Python
								</CardTitle>
								<CardDescription>
									{isReady
										? 'Pyodide est prêt à exécuter les calculs.'
										: 'Initialisation du moteur en cours...'}
								</CardDescription>
							</CardHeader>
							<CardContent className={styles.statusContent}>
								<Progress value={workerProgress} />
							</CardContent>
						</Card>
					</>
				)}

				{activePage === 'ondes' && (
					<>
						<WaveTour />
						<Equation />
						{viewMode === '2d' ? <Chart /> : <ThreeChart />}
						<HarmonicsDrawer />
					</>
				)}
				{activePage === 'packets' && (
					<>
						<WavePacketTour />
						<ChartWavePacket />
					</>
				)}
			</div>
			<div className={styles.parametersContainer}>
				{activePage === 'default'}
				{activePage === 'ondes' && <Parametre />}
				{activePage === 'packets' && <ParametreWavePacket />}
			</div>
		</div>
	);
}
