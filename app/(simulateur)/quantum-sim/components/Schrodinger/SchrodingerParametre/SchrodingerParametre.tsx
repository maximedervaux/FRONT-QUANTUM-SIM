import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Slider } from '@/components/ui/slider';
import { useSchrodingerStore, type PotentialType } from '../../../store/schrodinger.store';
import styles from './SchrodingerParametre.module.css';
import { ReactElement, useEffect } from 'react';
import { BoxIcon, CircleOffIcon, CirclePauseIcon, CirclePlayIcon, SquareIcon } from 'lucide-react';

const POTENTIAL_INFO = {
	free: 'Sans potentiel - Propagation libre',
	infiniteWell: 'Potentiel en forme de puits infini',
	step: 'Potentiel en forme de marche - Réflexion et transmission',
	barrier: 'Barrière de potentiel - Effet tunnel',
};

const LIMITS = {
	wellWidth: { min: 1, max: 15, step: 0.5 },
	wellDepth: { min: 0, max: 100, step: 5 },
	stepHeight: { min: 0, max: 100, step: 5 },
	barrierWidth: { min: 0.5, max: 5, step: 0.1 },
	barrierHeight: { min: 0, max: 100, step: 5 },
	timeSteps: { min: 10, max: 500, step: 10 },
	spatialPoints: { min: 100, max: 500, step: 50 },
};

export default function SchrodingerParametre() {
	const {
		wellWidth,
		stepHeight,
		barrierWidth,
		barrierHeight,
		timeSteps,
		spatialPoints,
		absorbingBoundaries,
		potentialType,
		isAnimatingTime,
		viewMode,
		setWellWidth,
		setStepHeight,
		setBarrierWidth,
		setBarrierHeight,
		setTimeSteps,
		setSpatialPoints,
		setAbsorbingBoundaries,
		setPotentialType,
		setViewMode,
		toggleAnimationTime,
	} = useSchrodingerStore();

	const potentialSelect: Array<{ label: string; value: PotentialType; icon?: ReactElement }> = [
		{ label: 'Sans potentiel', value: 'free', icon: <CircleOffIcon /> },
		{ label: 'Puits infini', value: 'infiniteWell', icon: <BoxIcon /> },
	];

	useEffect(() => {
		if (potentialType === 'free') {
			setViewMode('2d');
		}
	}, [potentialType, setViewMode]);

	return (
		<div className={styles.parametreContainer}>
			<div className={styles.section}>
				<p className={styles.sectionTitle}>Type de potentiel</p>
				<div className={styles.buttonGroupWrap}>
					<ButtonGroup>
						{potentialSelect.map(option => (
							<Button
								key={option.value}
								size="sm"
								variant={potentialType === option.value ? 'default' : 'outline'}
								onClick={() => setPotentialType(option.value)}
								aria-pressed={potentialType === option.value}
								title={POTENTIAL_INFO[option.value as keyof typeof POTENTIAL_INFO]}
							>
								{option.icon}
							</Button>
						))}
					</ButtonGroup>
				</div>
				<p className={styles.subText}>{POTENTIAL_INFO[potentialType as keyof typeof POTENTIAL_INFO]}</p>
			</div>

			{potentialType === 'infiniteWell' && (
				<div className={styles.section}>
					<p className={styles.sectionTitle}>Paramètres du puits infini</p>

					<div className={styles.inputContainer}>
						<div className={styles.inputHeader}>
							<label htmlFor="well-width-slider">
								<p>Largeur du puits</p>
							</label>
							<span className={styles.value}>{wellWidth.toFixed(1)}</span>
						</div>
						<Slider
							id="well-width-slider"
							value={[wellWidth]}
							min={LIMITS.wellWidth.min}
							max={LIMITS.wellWidth.max}
							step={LIMITS.wellWidth.step}
							onValueChange={value => setWellWidth(value[0])}
						/>
						<p className={styles.subText}>Distance entre les murs (m)</p>
					</div>

					<div className={styles.inputContainer}>
						<div className={styles.inputHeader}>
							<label htmlFor="view-mode-button">
								<p>Mode de visualisation</p>
							</label>
							<div className={styles.buttonGroupWrap}>
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
								</ButtonGroup>
							</div>
						</div>
					</div>
				</div>
			)}

			{potentialType === 'step' && (
				<div className={styles.section}>
					<p className={styles.sectionTitle}>Paramètres de la marche</p>

					<div className={styles.inputContainer}>
						<div className={styles.inputHeader}>
							<label htmlFor="step-height-slider">
								<p>Hauteur de la marche</p>
							</label>
							<span className={styles.value}>{stepHeight.toFixed(1)} eV</span>
						</div>
						<Slider
							id="step-height-slider"
							value={[stepHeight]}
							min={LIMITS.stepHeight.min}
							max={LIMITS.stepHeight.max}
							step={LIMITS.stepHeight.step}
							onValueChange={value => setStepHeight(value[0])}
						/>
						<p className={styles.subText}>Énergie du potentiel (eV)</p>
					</div>
				</div>
			)}

			{potentialType === 'barrier' && (
				<div className={styles.section}>
					<p className={styles.sectionTitle}>Paramètres de la barrière</p>

					<div className={styles.inputContainer}>
						<div className={styles.inputHeader}>
							<label htmlFor="barrier-width-slider">
								<p>Largeur de la barrière</p>
							</label>
							<span className={styles.value}>{barrierWidth.toFixed(1)}</span>
						</div>
						<Slider
							id="barrier-width-slider"
							value={[barrierWidth]}
							min={LIMITS.barrierWidth.min}
							max={LIMITS.barrierWidth.max}
							step={LIMITS.barrierWidth.step}
							onValueChange={value => setBarrierWidth(value[0])}
						/>
						<p className={styles.subText}>Largeur spatiale de la barrière</p>
					</div>

					<div className={styles.inputContainer}>
						<div className={styles.inputHeader}>
							<label htmlFor="barrier-height-slider">
								<p>Hauteur de la barrière</p>
							</label>
							<span className={styles.value}>{barrierHeight.toFixed(1)} eV</span>
						</div>
						<Slider
							id="barrier-height-slider"
							value={[barrierHeight]}
							min={LIMITS.barrierHeight.min}
							max={LIMITS.barrierHeight.max}
							step={LIMITS.barrierHeight.step}
							onValueChange={value => setBarrierHeight(value[0])}
						/>
						<p className={styles.subText}>Démonstration de l'effet tunnel quantique</p>
					</div>
				</div>
			)}

			<div className={styles.section}>
				<p className={styles.sectionTitle}>Simulation numérique</p>

				<div className={styles.inputContainer}>
					<div className={styles.inputHeader}>
						<label htmlFor="schrodinger-animation-button">
							<p>Lecture temporelle</p>
						</label>
					</div>
					<Button
						id="schrodinger-animation-button"
						onClick={toggleAnimationTime}
						variant={isAnimatingTime ? 'default' : 'outline'}
						title={isAnimatingTime ? "Mettre en pause l'animation" : "Lancer l'animation"}
						aria-label={isAnimatingTime ? 'Mettre en pause' : 'Lancer'}
						style={{ cursor: 'pointer' }}
					>
						{isAnimatingTime ? <CirclePauseIcon /> : <CirclePlayIcon />}
					</Button>
				</div>

				<div className={styles.inputContainer}>
					<div className={styles.inputHeader}>
						<label htmlFor="time-steps-slider">
							<p>Pas de temps</p>
						</label>
						<span className={styles.value}>{timeSteps}</span>
					</div>
					<Slider
						id="time-steps-slider"
						value={[timeSteps]}
						min={LIMITS.timeSteps.min}
						max={LIMITS.timeSteps.max}
						step={LIMITS.timeSteps.step}
						onValueChange={value => setTimeSteps(value[0])}
					/>
					<p className={styles.subText}>Nombre d'images d'animation</p>
				</div>

				<div className={styles.inputContainer}>
					<div className={styles.inputHeader}>
						<label htmlFor="spatial-points-slider">
							<p>Points spatiaux</p>
						</label>
						<span className={styles.value}>{spatialPoints}</span>
					</div>
					<Slider
						id="spatial-points-slider"
						value={[spatialPoints]}
						min={LIMITS.spatialPoints.min}
						max={LIMITS.spatialPoints.max}
						step={LIMITS.spatialPoints.step}
						onValueChange={value => setSpatialPoints(value[0])}
					/>
					<p className={styles.subText}>Résolution spatiale (plus = plus précis mais lent)</p>
				</div>

				<div className={styles.inputContainer}>
					<div className={styles.checkboxWrap}>
						<input
							type="checkbox"
							id="absorbing-boundaries"
							checked={absorbingBoundaries}
							onChange={e => setAbsorbingBoundaries(e.target.checked)}
						/>
						<label htmlFor="absorbing-boundaries">Conditions aux limites absorbantes</label>
					</div>
					<p className={styles.subText}>Évite les réflexions parasites aux bords du domaine</p>
				</div>
			</div>
		</div>
	);
}
