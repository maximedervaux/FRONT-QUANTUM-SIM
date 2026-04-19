'use client';
import { useEffect, useState } from 'react';
import { usePythonFunction } from '../../../hooks/usePythonFunction';
import { useWavePacketStore } from '../../../store/wave-packet.store';
import style from './WavePacketInfo.module.css';

interface PacketInfo {
	width_x: number;
	width_k: number;
	uncertainty_product: number;
	group_velocity: number;
	waveNumber_center: number;
}

export default function WavePacketInfo() {
	const { packetType, k_center, sigma_k } = useWavePacketStore();
	const [info, setInfo] = useState<PacketInfo | null>(null);

	const { execute, isReady } = usePythonFunction('wave_packet', 'get_packet_info');

	useEffect(() => {
		if (!isReady || packetType !== 'gaussian') return;

		const fetchInfo = async () => {
			try {
				const result = await execute({
					packet_type: packetType,
					k_center,
					sigma_k,
				});
				setInfo(result as PacketInfo);
			} catch (err) {
				console.error('Error fetching packet info:', err);
			}
		};

		fetchInfo();
	}, [packetType, k_center, sigma_k, execute, isReady]);

	if (!info || packetType !== 'gaussian') {
		return null;
	}

	return (
		<div className={style.infoPanel}>
			<h3>Propriétés théoriques</h3>

			<div className={style.properties}>
				<div className={style.property}>
					<span className={style.label}>Largeur spatiale (Δx)</span>
					<span className={style.value}>{info.width_x.toFixed(3)} m</span>
				</div>

				<div className={style.property}>
					<span className={style.label}>Largeur spectrale (Δk)</span>
					<span className={style.value}>{info.width_k.toFixed(3)} rad/m</span>
				</div>

				<div className={style.property}>
					<span className={style.label}>Produit d'incertitude</span>
					<span className={style.value}>
						{info.uncertainty_product.toFixed(3)}
						<span className={style.indicator}>{info.uncertainty_product >= 0.5 ? ' ✓' : ' ✗'}</span>
					</span>
				</div>

				<div className={style.property}>
					<span className={style.label}>Longueur d'onde centrale</span>
					<span className={style.value}>{info.waveNumber_center.toFixed(3)} m</span>
				</div>

				<div className={style.property}>
					<span className={style.label}>Vitesse de groupe</span>
					<span className={style.value}>{info.group_velocity.toFixed(3)} m/s</span>
				</div>
			</div>

			<div className={style.note}>
				<p>
					<strong>Note :</strong> Le principe d'incertitude d'Heisenberg impose Δx·Δk ≥ ½. Un paquet
					d'ondes gaussien minimise cette relation.
				</p>
			</div>
		</div>
	);
}
