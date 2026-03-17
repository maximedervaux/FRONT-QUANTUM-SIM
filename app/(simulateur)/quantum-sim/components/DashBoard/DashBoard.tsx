import Chart from '../Ondes/2DChart/Chart';
import styles from './DashBoard.module.css';
import Parametre from '../Ondes/Parametre/Parametre';
import { useNavigationStore } from '../../store/navigation.store';
import Equation from '../Ondes/Equation/Equation';
import WavePacketsDrawer from '../Packets/WavePacketsDrawer/WavePacketsDrawer';
import { usePythonWorker } from '../../../core/contexts/PythonWorkerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Cpu, FlaskConical, Gauge, Play, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useWaveStore } from '../../store/onde.store';
import WavePacketsStats from './WavePacketsStats/WavePacketsStats';

//TODO: Retravailler car la structure n'esst pas très extensible
export default function DashBoard() {
	const { activePage, setActivePage } = useNavigationStore();
	const {
		amplitude,
		phase,
		harmonics,
		wavelength,
		period,
		time,
		isAnimatingPhase,
		isAnimatingTime,
		setFunction,
		setWavelength,
		setPeriod,
		setHarmonics,
		resetPhase,
		resetTime,
		toggleAnimationTime,
	} = useWaveStore();
	const { isReady, loadedScripts } = usePythonWorker();

	const [isFirstVisit, setIsFirstVisit] = useState(true);
	const [lastSnapshot, setLastSnapshot] = useState<null | {
		wavelength: number;
		period: number;
		harmonics: number;
		time: number;
	}>(null);

	useEffect(() => {
		const visitKey = 'quantum-sim-visited';
		const snapshotKey = 'quantum-sim-last-snapshot';

		const hasVisited = localStorage.getItem(visitKey) === 'true';
		setIsFirstVisit(!hasVisited);
		localStorage.setItem(visitKey, 'true');

		const rawSnapshot = localStorage.getItem(snapshotKey);
		if (!rawSnapshot) return;

		try {
			const parsed = JSON.parse(rawSnapshot) as {
				wavelength: number;
				period: number;
				harmonics: number;
				time: number;
			};
			setLastSnapshot(parsed);
		} catch {
			setLastSnapshot(null);
		}
	}, []);

	useEffect(() => {
		const snapshot = {
			wavelength,
			period,
			harmonics,
			time,
		};

		localStorage.setItem('quantum-sim-last-snapshot', JSON.stringify(snapshot));
		setLastSnapshot(snapshot);
	}, [wavelength, period, harmonics, time]);

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
		setWavelength(6);
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
						<WavePacketsStats />
					</>
				)}

				{activePage === 'ondes' && (
					<>
						<Equation />
						<Chart />
						<WavePacketsDrawer showTrigger={false} />
					</>
				)}
				{activePage === 'packets'}
			</div>
			<div className={styles.parametersContainer}>
				{activePage === 'default'}
				{activePage === 'ondes' && <Parametre />}
				{activePage === 'packets'}
			</div>
		</div>
	);
}
