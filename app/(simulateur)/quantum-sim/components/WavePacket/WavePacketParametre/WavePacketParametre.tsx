import style from './WavePacketParametre.module.css';
import { Slider } from '@/components/ui/slider';
import { useWavePacketStore } from '../../../store/wave-packet.store';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';

const LIMITS = {
	k_center: { min: 0.1, max: 20, step: 0.1 },
	sigma_k: { min: 0.1, max: 5, step: 0.1 },
	x_center: { min: -10, max: 10, step: 0.5 },
	nWaves: { min: 5, max: 1000, step: 1 },
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

	// Animation temporelle
	useEffect(() => {
		if (!isAnimatingTime) return;
		const interval = setInterval(() => setTime(10), 50);
		return () => clearInterval(interval);
	}, [isAnimatingTime, setTime]);

	return (
		<div className={style.parametre}>
			<h1>Paquet d'ondes</h1>

			{/* Type de paquet */}
			<div className={style.section}>
				<h3>Type de paquet</h3>
				<NativeSelect value={packetType} onChange={e => setPacketType(e.target.value as any)}>
					<NativeSelectOption value="gaussian">Gaussien</NativeSelectOption>
					<NativeSelectOption value="random">Aléatoire</NativeSelectOption>
					<NativeSelectOption value="custom">Personnalisé</NativeSelectOption>
				</NativeSelect>
			</div>

			{/* Présets */}
			<div className={style.section}>
				<h3>Présets</h3>
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

			{/* Paramètres physiques (Gaussien) */}
			{packetType === 'gaussian' && (
				<>
					<div className={style.inputContainer}>
						<p>Vecteur d'onde central (k₀)</p>
						<Slider
							value={[k_center]}
							min={LIMITS.k_center.min}
							max={LIMITS.k_center.max}
							step={LIMITS.k_center.step}
							onValueChange={value => setKCenter(value[0])}
						/>
						<span className={style.value}>{k_center.toFixed(1)} rad/m</span>
					</div>

					<div className={style.inputContainer}>
						<p>Largeur spectrale (Δk)</p>
						<Slider
							value={[sigma_k]}
							min={LIMITS.sigma_k.min}
							max={LIMITS.sigma_k.max}
							step={LIMITS.sigma_k.step}
							onValueChange={value => setSigmaK(value[0])}
						/>
						<span className={style.value}>{sigma_k.toFixed(1)} rad/m</span>
					</div>

					<div className={style.inputContainer}>
						<p>Position centrale (x₀)</p>
						<Slider
							value={[x_center]}
							min={LIMITS.x_center.min}
							max={LIMITS.x_center.max}
							step={LIMITS.x_center.step}
							onValueChange={value => setXCenter(value[0])}
						/>
						<span className={style.value}>{x_center.toFixed(1)} m</span>
					</div>
				</>
			)}

			{/* Nombre d'ondes */}
			<div className={style.inputContainer}>
				<p>Nombre d'ondes planes</p>
				<Slider
					value={[nWaves]}
					min={LIMITS.nWaves.min}
					max={LIMITS.nWaves.max}
					step={LIMITS.nWaves.step}
					onValueChange={value => setNWaves(value[0])}
				/>
				<span className={style.value}>{nWaves}</span>
			</div>

			{/* Contrôle temporel */}
			<div className={style.buttonContainer}>
				<p>Temps : {time.toFixed(2)} s</p>
				<Button onClick={toggleAnimationTime}>{isAnimatingTime ? '⏸️' : '▶️'}</Button>
				<Button onClick={resetTime} variant="outline">
					Reset
				</Button>
			</div>

			{/* Mode de visualisation */}
			<div className={style.section}>
				<h3>Visualisation</h3>
				<NativeSelect
					value={visualizationMode}
					onChange={e => setVisualizationMode(e.target.value as any)}
				>
					<NativeSelectOption value="wavefunction">Fonction d'onde ψ(x)</NativeSelectOption>
					<NativeSelectOption value="probability">Densité de probabilité |ψ|²</NativeSelectOption>
				</NativeSelect>
			</div>

			{/* Limites spatiales */}
			<div className={style.section}>
				<h3>Fenêtre spatiale</h3>
				<div className={style.rangeInputs}>
					<div className={style.inputContainer}>
						<p>x min</p>
						<Input
							type="number"
							value={xMin}
							min={LIMITS.xMin.min}
							max={LIMITS.xMin.max}
							step={LIMITS.xMin.step}
							onChange={e => setXMin(Number(e.target.value))}
						/>
					</div>
					<div className={style.inputContainer}>
						<p>x max</p>
						<Input
							type="number"
							value={xMax}
							min={LIMITS.xMax.min}
							max={LIMITS.xMax.max}
							step={LIMITS.xMax.step}
							onChange={e => setXMax(Number(e.target.value))}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
