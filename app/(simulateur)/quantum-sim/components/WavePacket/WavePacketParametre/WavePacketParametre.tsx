import style from './WavePacketParametre.module.css';
import { Slider } from '@/components/ui/slider';
import {
	useWavePacketStore,
	type VisualizationMode,
	type WavePacketType,
} from '../../../store/wave-packet.store';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';

const LIMITS = {
	k_center: { min: 0.1, max: 20, step: 0.1 },
	sigma_k: { min: 0.1, max: 5, step: 0.1 },
	x_center: { min: -10, max: 10, step: 0.5 },
	nWaves: { min: 5, max: 200, step: 1 },
	xMin: { min: -50, max: 0, step: 1 },
	xMax: { min: 0, max: 50, step: 1 },
};

export default function ParametreWavePacket() {
	const {
		packetType,
		k_center,
		sigma_k,
		x_center,
		nWaves,
		time,
		isAnimatingTime,
		visualizationMode,
		xMin,
		xMax,
		setPacketType,
		setKCenter,
		setSigmaK,
		setXCenter,
		setNWaves,
		setTime,
		toggleAnimationTime,
		resetTime,
		setVisualizationMode,
		setXMin,
		setXMax,
		loadGaussianPreset,
		loadNarrowPreset,
		loadWidePreset,
	} = useWavePacketStore();

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

	const packetTypeButtons: Array<{ label: string; value: WavePacketType }> = [
		{ label: 'Gaussien', value: 'gaussian' },
		{ label: 'Aléatoire', value: 'random' },
		{ label: 'Personnalisé', value: 'custom' },
	];

	const visualizationButtons: Array<{ label: string; value: VisualizationMode }> = [
		{ label: 'ψ(x) Fonction d\'onde', value: 'wavefunction' },
		{ label: '|ψ|² Densité de probabilité', value: 'probability' },
	];

	return (
		<div className={style.parametre}>
			<h1>Paquet d'ondes</h1>

			<div className={style.section}>
				<p className={style.sectionTitle}>Type de paquet</p>
				<div className={style.buttonGroupWrap}>
					<ButtonGroup>
						{packetTypeButtons.map(option => (
							<Button
								key={option.value}
								size="sm"
								variant={packetType === option.value ? 'default' : 'outline'}
								onClick={() => setPacketType(option.value)}
							>
								{option.label}
							</Button>
						))}
					</ButtonGroup>
				</div>
			</div>

			<div className={style.section}>
				<p className={style.sectionTitle}>Présets rapides</p>
				<div className={style.buttonGroupWrap}>
					<ButtonGroup>
						<Button size="sm" variant="outline" onClick={loadGaussianPreset}>
							Standard
						</Button>
						<Button size="sm" variant="outline" onClick={loadNarrowPreset}>
							Étroit
						</Button>
						<Button size="sm" variant="outline" onClick={loadWidePreset}>
							Large
						</Button>
					</ButtonGroup>
				</div>
			</div>

			{packetType === 'gaussian' && (
				<>
					<div className={style.inputContainer}>
						<div className={style.inputHeader}>
							<p>Vecteur d'onde central (k₀)</p>
							<span className={style.value}>{k_center.toFixed(1)} rad/m</span>
						</div>
						<Slider
							value={[k_center]}
							min={LIMITS.k_center.min}
							max={LIMITS.k_center.max}
							step={LIMITS.k_center.step}
							onValueChange={value => setKCenter(value[0])}
						/>
					</div>

					<div className={style.inputContainer}>
						<div className={style.inputHeader}>
							<p>Largeur spectrale (Δk)</p>
							<span className={style.value}>{sigma_k.toFixed(1)} rad/m</span>
						</div>
						<Slider
							value={[sigma_k]}
							min={LIMITS.sigma_k.min}
							max={LIMITS.sigma_k.max}
							step={LIMITS.sigma_k.step}
							onValueChange={value => setSigmaK(value[0])}
						/>
					</div>

					<div className={style.inputContainer}>
						<div className={style.inputHeader}>
							<p>Position centrale (x₀)</p>
							<span className={style.value}>{x_center.toFixed(1)} m</span>
						</div>
						<Slider
							value={[x_center]}
							min={LIMITS.x_center.min}
							max={LIMITS.x_center.max}
							step={LIMITS.x_center.step}
							onValueChange={value => setXCenter(value[0])}
						/>
					</div>
				</>
			)}

			<div className={style.inputContainer}>
				<div className={style.inputHeader}>
					<p>Nombre d'ondes planes</p>
					<span className={style.value}>{nWaves}</span>
				</div>
				<Slider
					value={[nWaves]}
					min={LIMITS.nWaves.min}
					max={LIMITS.nWaves.max}
					step={LIMITS.nWaves.step}
					onValueChange={value => setNWaves(value[0])}
				/>
			</div>

			<div className={style.buttonContainer}>
				<p>Temps : {time.toFixed(1)} s</p>
				<Button onClick={toggleAnimationTime}>{isAnimatingTime ? '⏸️' : '▶️'}</Button>
				<Button onClick={resetTime} variant="outline">
					Reset
				</Button>
			</div>

			<div className={style.section}>
				<p className={style.sectionTitle}>Visualisation</p>
				<div className={style.buttonGroupWrap}>
					<ButtonGroup>
						{visualizationButtons.map(option => (
							<Button
								key={option.value}
								size="sm"
								variant={visualizationMode === option.value ? 'default' : 'outline'}
								onClick={() => setVisualizationMode(option.value)}
							>
								{option.label}
							</Button>
						))}
					</ButtonGroup>
				</div>
			</div>

			<div className={style.section}>
				<p className={style.sectionTitle}>Fenêtre spatiale</p>
				<div className={style.rangeInputs}>
					<div className={style.inputContainer}>
						<p>x min</p>
						<Input
							type="number"
							value={xMin}
							min={LIMITS.xMin.min}
							max={LIMITS.xMin.max}
							step={LIMITS.xMin.step}
							onChange={e => setSafeXMin(Number(e.target.value))}
						/>
					</div>
					<div className={style.rangeSeparator}>→</div>
					<div className={style.inputContainer}>
						<p>x max</p>
						<Input
							type="number"
							value={xMax}
							min={LIMITS.xMax.min}
							max={LIMITS.xMax.max}
							step={LIMITS.xMax.step}
							onChange={e => setSafeXMax(Number(e.target.value))}
						/>
					</div>
				</div>
				<p className={style.subText}>Astuce: gardez une fenêtre centrée autour de x = 0 pour une lecture plus stable.</p>
			</div>
		</div>
	);
}
