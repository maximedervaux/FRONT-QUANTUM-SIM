import style from './Parametre.module.css';
import { Slider } from '@/components/ui/slider';
import { useWaveStore } from '../../../store/onde.store';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { SlidersHorizontal, Info } from 'lucide-react';

const LIMITS = {
	harmonics: { min: 1, max: 20 },
	waveNumber: { min: 0.01, max: 100 },
	period: { min: 1, max: 100 },
};

const WAVE_DESCRIPTIONS = {
	gaussian: 'Onde gaussienne - Distribution normale, lisse et symétrique',
	sinus: 'Onde sinusoidale - Oscillation régulière et périodique',
};

export default function Parametre() {
	const {
		harmonics,
		waveNumber,
		period,
		time,
		isAnimatingTime,
		viewMode,
		showImaginary,
		setFunction,
		setHarmonics,
		setWaveNumber,
		setPeriod,
		setTime,
		setViewMode,
		toggleShowImaginary,
		toggleAnimationTime,
		toggleHarmonicsDrawer,
		resetTime,
	} = useWaveStore();

	const clamp = (value: number, min: number, max: number) => 
		Math.max(min, Math.min(max, value));

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
			<h1>⚛️ Paramètres de l'onde</h1>

			{/* Section: Fonction d'onde */}
			<div className={style.section}>
				<p className={style.sectionTitle}>Fonction d'onde</p>
				<div className={style.selectContainer}>
					<select 
						onChange={handleFunctionChange}
						defaultValue=""
						aria-label="Sélectionner la fonction d'onde"
						className={style.functionSelect}
					>
						<option value="" disabled>
							Choisir une fonction d'onde...
						</option>
						<option value="gaussian">Gaussienne</option>
						<option value="sinus">Sinusoidale</option>
					</select>
				</div>
			</div>

			{/* Section: Paramètres de base */}
			<div className={style.section}>
				<p className={style.sectionTitle}>Paramètres fondamentaux</p>

				{/* Période */}
				<div className={style.inputContainer}>
					<div className={style.inputHeader}>
						<label htmlFor="period-slider">
							<p>Période (T)</p>
						</label>
						<span className={style.value}>{period.toFixed(1)} s</span>
					</div>
					<Slider
						id="period-slider"
						value={[period]}
						min={LIMITS.period.min}
						max={LIMITS.period.max}
						step={1}
						onValueChange={value => setPeriod(value[0])}
						aria-label="Période de l'onde"
					/>
					<p className={style.subText}>
						Temps nécessaire pour une oscillation complète
					</p>
				</div>

				{/* Nombre d'onde */}
				<div className={style.inputContainer}>
					<div className={style.inputHeader}>
						<label htmlFor="wave-number-input">
							<p>Nombre d'onde (k)</p>
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
			<div className={style.section}>
				<div className={style.harmonicHeader}>
					<div>
						<p className={style.sectionTitle}>Harmoniques</p>
						<p className={style.subText}>
							Nombre de fréquences superposées
						</p>
					</div>
					<Button 
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
						if (!isNaN(val)) 
							setHarmonics(clamp(val, LIMITS.harmonics.min, LIMITS.harmonics.max));
					}}
					aria-label="Nombre d'harmoniques"
					placeholder="Entre 1 et 20"
				/>
			</div>

			{/* Section: Contrôles temporels */}
			<div className={style.buttonContainer}>
				<p>
					⏱️ <strong>Temps:</strong> {time.toFixed(1)} s
				</p>
				<Button 
					onClick={toggleAnimationTime}
					variant={isAnimatingTime ? 'default' : 'outline'}
					title={isAnimatingTime ? 'Pausser l\'animation' : 'Lancer l\'animation'}
					aria-label={isAnimatingTime ? 'Pausser' : 'Lancer'}
				>
					{isAnimatingTime ? '⏸️' : '▶️'}
				</Button>
				<Button 
					onClick={resetTime} 
					variant="outline"
					title="Réinitialiser le temps à 0"
					aria-label="Réinitialiser"
				>
					↻ Reset
				</Button>
			</div>

			{/* Section: Visualisation */}
			<div className={style.section}>
				<p className={style.sectionTitle}>Options de visualisation</p>
				<div className={style.buttonGroupWrap}>
					<ButtonGroup>
						<Button 
							size="sm" 
							variant={viewMode === '2d' ? 'default' : 'outline'} 
							onClick={() => setViewMode('2d')}
							aria-pressed={viewMode === '2d'}
						>
							📊 2D
						</Button>
						<Button 
							size="sm" 
							variant={viewMode === '3d' ? 'default' : 'outline'} 
							onClick={() => setViewMode('3d')}
							aria-pressed={viewMode === '3d'}
						>
							🎯 3D
						</Button>
						<Button 
							size="sm" 
							variant={showImaginary ? 'default' : 'outline'} 
							onClick={toggleShowImaginary}
							aria-pressed={showImaginary}
						>
							𝑖 Imaginaire
						</Button>
					</ButtonGroup>
				</div>
			</div>

			
		</div>
	);
}