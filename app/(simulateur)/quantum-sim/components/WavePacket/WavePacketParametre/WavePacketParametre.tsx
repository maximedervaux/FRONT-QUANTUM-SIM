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
	k_center: { min: -20, max: 20, step: 0.1 },
	sigma_k: { min: 0.1, max: 5, step: 0.1 },
	x_center: { min: -10, max: 10, step: 0.5 },
	nWaves: { min: 5, max: 200, step: 1 },
	xMin: { min: -50, max: 0, step: 1 },
	xMax: { min: 0, max: 50, step: 1 },
};

const PACKET_TYPE_INFO = {
	gaussian: 'Distribution gaussienne - Lisse et symétrique',
	random: 'Distribution aléatoire - Phases aléatoires',
	custom: 'Configuration personnalisée - Paramètres manuels',
};

export default function ParametreWavePacket() {
	const {
		packetType,
		k_center,
		sigma_k,
		x_center,
		nWaves,
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
		{ label: "ψ(x) Fonction d'onde", value: 'wavefunction' },
		{ label: '|ψ|² Densité de probabilité', value: 'probability' },
	];

	const getPacketDescription = () => {
		return PACKET_TYPE_INFO[packetType as keyof typeof PACKET_TYPE_INFO];
	};

	return (
		<div className={style.parametre}>
			<h1>📦 Paquet d'ondes quantiques</h1>

			{/* Section: Type de paquet */}
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
								aria-pressed={packetType === option.value}
								title={PACKET_TYPE_INFO[option.value as keyof typeof PACKET_TYPE_INFO]}
							>
								{option.label}
							</Button>
						))}
					</ButtonGroup>
				</div>
				<p className={style.subText}>{getPacketDescription()}</p>
			</div>

			{/* Section: Présets rapides */}
			<div className={style.section}>
				<p className={style.sectionTitle}>Présets rapides</p>
				<div className={style.buttonGroupWrap}>
					<ButtonGroup>
						<Button
							size="sm"
							variant="outline"
							onClick={loadGaussianPreset}
							title="Charger configuration standard"
						>
							⚡ Standard
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={loadNarrowPreset}
							title="Paquet étroit - Faible dispersion"
						>
							🎯 Étroit
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={loadWidePreset}
							title="Paquet large - Forte dispersion"
						>
							📐 Large
						</Button>
					</ButtonGroup>
				</div>
			</div>

			{/* Section: Paramètres gaussiens */}
			{packetType === 'gaussian' && (
				<div className={style.section}>
					<p className={style.sectionTitle}>Paramètres gaussiens</p>

					{/* Vecteur d'onde central */}
					<div className={style.inputContainer}>
						<div className={style.inputHeader}>
							<label htmlFor="k-center-slider">
								<p>Vecteur d'onde central (k₀)</p>
							</label>
							<span className={style.value}>{k_center.toFixed(2)} rad/m</span>
						</div>
						<Slider
							id="k-center-slider"
							value={[k_center]}
							min={LIMITS.k_center.min}
							max={LIMITS.k_center.max}
							step={LIMITS.k_center.step}
							onValueChange={value => setKCenter(value[0])}
							aria-label="Vecteur d'onde central"
						/>
						<p className={style.subText}>Fréquence d'oscillation dominante du paquet</p>
					</div>

					{/* Largeur spectrale */}
					<div className={style.inputContainer}>
						<div className={style.inputHeader}>
							<label htmlFor="sigma-k-slider">
								<p>Largeur spectrale (Δk)</p>
							</label>
							<span className={style.value}>{sigma_k.toFixed(2)} rad/m</span>
						</div>
						<Slider
							id="sigma-k-slider"
							value={[sigma_k]}
							min={LIMITS.sigma_k.min}
							max={LIMITS.sigma_k.max}
							step={LIMITS.sigma_k.step}
							onValueChange={value => setSigmaK(value[0])}
							aria-label="Largeur spectrale"
						/>
						<p className={style.subText}>Relation d'incertitude: Δx · Δk ≥ 1/2</p>
					</div>

					{/* Position centrale */}
					<div className={style.inputContainer}>
						<div className={style.inputHeader}>
							<label htmlFor="x-center-slider">
								<p>Position centrale (x₀)</p>
							</label>
							<span className={style.value}>{x_center.toFixed(1)} m</span>
						</div>
						<Slider
							id="x-center-slider"
							value={[x_center]}
							min={LIMITS.x_center.min}
							max={LIMITS.x_center.max}
							step={LIMITS.x_center.step}
							onValueChange={value => setXCenter(value[0])}
							aria-label="Position centrale du paquet"
						/>
					</div>
				</div>
			)}

			{/* Section: Nombre d'ondes planes */}
			<div className={style.section}>
				<p className={style.sectionTitle}>Composition du paquet</p>
				<div className={style.inputContainer}>
					<div className={style.inputHeader}>
						<label htmlFor="nwaves-slider">
							<p>Nombre d'ondes planes</p>
						</label>
						<span className={style.value}>{nWaves}</span>
					</div>
					<Slider
						id="nwaves-slider"
						value={[nWaves]}
						min={LIMITS.nWaves.min}
						max={LIMITS.nWaves.max}
						step={LIMITS.nWaves.step}
						onValueChange={value => setNWaves(value[0])}
						aria-label="Nombre d'ondes planes composant le paquet"
					/>
					<p className={style.subText}>Plus d'ondes = meilleure résolution du paquet</p>
				</div>
			</div>

			{/* Section: Visualisation */}
			<div className={style.section}>
				<p className={style.sectionTitle}>Mode de visualisation</p>
				<div className={style.buttonGroupWrap}>
					<ButtonGroup>
						{visualizationButtons.map(option => (
							<Button
								key={option.value}
								size="sm"
								variant={visualizationMode === option.value ? 'default' : 'outline'}
								onClick={() => setVisualizationMode(option.value)}
								aria-pressed={visualizationMode === option.value}
							>
								{option.label}
							</Button>
						))}
					</ButtonGroup>
				</div>
			</div>

			{/* Section: Fenêtre spatiale */}
			<div className={style.section}>
				<p className={style.sectionTitle}>Fenêtre spatiale</p>
				<div className={style.rangeInputs}>
					<div className={style.inputContainer}>
						<label htmlFor="xmin-input">
							<p>x min</p>
						</label>
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
					<div className={style.rangeSeparator}>→</div>
					<div className={style.inputContainer}>
						<label htmlFor="xmax-input">
							<p>x max</p>
						</label>
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
				</div>
				<p className={style.subText}>
					💡 Astuce: gardez une fenêtre centrée autour de x = 0 pour une lecture plus stable.
				</p>
			</div>
		</div>
	);
}
