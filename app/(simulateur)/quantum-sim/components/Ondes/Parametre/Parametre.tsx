import style from './Parametre.module.css';
import { useWaveStore } from '../../../store/onde.store';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { formatTimeQuantum } from '../../../services/formatQuantumTime.service';
import {
	SlidersHorizontal,
	TimerResetIcon,
	CirclePlayIcon,
	CirclePauseIcon,
	TimerIcon,
	SquareIcon,
	BoxIcon,
	Axis3DIcon,
	WavesIcon,
} from 'lucide-react';

const LIMITS = {
	harmonics: { min: 1, max: 20 },
	waveNumber: { min: 0.01, max: 100 },
	xMin: { min: -50, max: 0, step: 1 },
	xMax: { min: 0, max: 50, step: 1 },
};

export default function Parametre() {
	const {
		harmonics,
		waveNumber,
		time,
		isAnimatingTime,
		viewMode,
		showImaginary,
		xMin,
		xMax,
		setFunction,
		setHarmonics,
		setWaveNumber,
		setTime,
		setViewMode,
		toggleShowImaginary,
		toggleAnimationTime,
		toggleHarmonicsDrawer,
		resetTime,
		setXMin,
		setXMax,
	} = useWaveStore();

	const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

	const setSafeXMin = (raw: number) => {
		if (Number.isNaN(raw)) return;
		const clamped = clamp(raw, LIMITS.xMin.min, LIMITS.xMin.max);
		setXMin(Math.min(clamped, xMax - 1));
	};

	const setSafeXMax = (raw: number) => {
		if (Number.isNaN(raw)) return;
		const clamped = clamp(raw, LIMITS.xMax.min, LIMITS.xMax.max);
		setXMax(Math.max(clamped, xMin + 1));
	};

	useEffect(() => {
		if (!isAnimatingTime) return;
		const interval = setInterval(() => setTime(10), 50);
		return () => clearInterval(interval);
	}, [isAnimatingTime, setTime]);

	const handleFunctionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value as any;
		if (value) setFunction(value);
	};

	return (
		<div className={style.parametre}>
			<h1>
				<WavesIcon size={30} /> Paramètres de l'onde
			</h1>

			{/* Section: Fonction d'onde */}
			<div className={style.section} data-tour="wave-function-select">
				<p className={style.sectionTitle}>Fonction d'onde</p>
				<div className={style.selectContainer}>
					<select
						onChange={handleFunctionChange}
						defaultValue=""
						aria-label="Sélectionner la fonction d'onde"
						className={style.functionSelect}
					>
						<option value="sinus">Sinusoïde</option>
						<option value="gaussian">Gaussienne</option>
					</select>
				</div>
			</div>

			{/* Section: Paramètres de base */}
			<div className={style.section}>
				<p className={style.sectionTitle}>Paramètres fondamentaux</p>
				<div className={style.inputContainer}>
					<div className={style.inputHeader}>
						<label htmlFor="xmin-input">
							<p>Borne inférieure</p>
						</label>
					</div>
					<Input
						id="xmin-input"
						type="number"
						value={xMin}
						min={LIMITS.xMin.min}
						max={LIMITS.xMin.max}
						step={LIMITS.xMin.step}
						onChange={e => setSafeXMin(Number(e.target.value))}
						aria-label="Position minimum de la fenêtre"
						placeholder="Min"
					/>
				</div>
				<div className={style.inputContainer}>
					<div className={style.inputHeader}>
						<label htmlFor="xmax-input">
							<p>Borne supérieure</p>
						</label>
					</div>
					<Input
						id="xmax-input"
						type="number"
						value={xMax}
						min={LIMITS.xMax.min}
						max={LIMITS.xMax.max}
						step={LIMITS.xMax.step}
						onChange={e => setSafeXMax(Number(e.target.value))}
						aria-label="Position maximum de la fenêtre"
						placeholder="Max"
					/>
				</div>
				{/* Nombre d'onde */}
				<div className={style.inputContainer} data-tour="wave-number">
					<div className={style.inputHeader}>
						<label htmlFor="wave-number-input">
							<p>Nombre d’onde k (en multiples de π)</p>
						</label>
					</div>
					<div className={style.inputRow}>
						<Input
							id="wave-number-input"
							placeholder="Ex: 1.5"
							type="number"
							min={LIMITS.waveNumber.min}
							max={LIMITS.waveNumber.max}
							step={0.01}
							value={waveNumber || ''}
							onChange={e => {
								const val = e.target.valueAsNumber;
								setWaveNumber(
									isNaN(val)
										? LIMITS.waveNumber.min
										: clamp(val, LIMITS.waveNumber.min, LIMITS.waveNumber.max)
								);
							}}
							aria-label="Nombre d'onde"
						/>
					</div>
				</div>
			</div>

			{/* Section: Harmoniques */}
			<div className={style.section} data-tour="wave-harmonics">
				<div className={style.harmonicHeader}>
					<div>
						<p className={style.sectionTitle}>Harmoniques</p>
						<p className={style.subText}>Nombre de fréquences superposées</p>
					</div>
					<Button
						style={{ cursor: 'pointer' }}
						variant="ghost"
						size="sm"
						onClick={toggleHarmonicsDrawer}
						aria-label="Ouvrir l'éditeur d'amplitudes des harmoniques"
					>
						<SlidersHorizontal size={16} />
						Amplitudes
					</Button>
				</div>
				<Input
					type="number"
					value={harmonics || ''}
					min={LIMITS.harmonics.min}
					max={LIMITS.harmonics.max}
					onChange={e => {
						const val = e.target.valueAsNumber;
						if (!isNaN(val)) setHarmonics(clamp(val, LIMITS.harmonics.min, LIMITS.harmonics.max));
					}}
					aria-label="Nombre d'harmoniques"
					placeholder="Entre 1 et 20"
				/>
			</div>

			{/* Section: Contrôles temporels */}
			<div className={style.buttonContainer}>
				<div className={style.timeContainer}>
					<div className={style.timeLabel}>
						<TimerIcon size={20} />
						<span className={style.labelText}>Temps écoulé</span>
					</div>
					<span className={style.timeValue}>{formatTimeQuantum(time)}</span>
				</div>
				<Button
					onClick={toggleAnimationTime}
					variant={isAnimatingTime ? 'default' : 'outline'}
					title={isAnimatingTime ? "Mettre en pause l'animation" : "Lancer l'animation"}
					aria-label={isAnimatingTime ? 'Mettre en pause' : 'Lancer'}
					style={{ cursor: 'pointer' }}
				>
					{isAnimatingTime ? <CirclePauseIcon /> : <CirclePlayIcon />}
				</Button>
				<Button
					onClick={resetTime}
					variant="outline"
					title="Réinitialiser le temps à 0"
					aria-label="Réinitialiser"
					style={{ cursor: 'pointer' }}
				>
					<TimerResetIcon />
				</Button>
			</div>

			{/* Section: Visualisation */}
			<div className={style.section} data-tour="wave-visual-options">
				<p className={style.sectionTitle}>Options de visualisation</p>
				<div className={style.buttonGroupWrap}>
					<ButtonGroup>
						<Button
							size="sm"
							variant={viewMode === '2d' ? 'default' : 'outline'}
							onClick={() => setViewMode('2d')}
							aria-pressed={viewMode === '2d'}
							style={{ cursor: 'pointer' }}
						>
							<SquareIcon /> 2D
						</Button>
						<Button
							size="sm"
							variant={viewMode === '3d' ? 'default' : 'outline'}
							onClick={() => setViewMode('3d')}
							aria-pressed={viewMode === '3d'}
							style={{ cursor: 'pointer' }}
						>
							<BoxIcon /> 3D
						</Button>
						<Button
							size="sm"
							variant={showImaginary ? 'default' : 'outline'}
							onClick={toggleShowImaginary}
							aria-pressed={showImaginary}
							style={{ cursor: 'pointer' }}
						>
							<Axis3DIcon /> Imaginaire
						</Button>
					</ButtonGroup>
				</div>
			</div>
		</div>
	);
}
