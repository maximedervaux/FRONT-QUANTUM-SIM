import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { SlidersHorizontal } from 'lucide-react';
import { useWaveStore } from '../../../store/onde.store';
import { Slider } from '@/components/ui/slider';
import styles from './HarmonicsDrawer.module.css';

export default function HarmonicsDrawer() {
	const {
		harmonics,
		harmonicAmplitudes,
		isHarmonicsDrawerOpen,
		setHarmonicsDrawerOpen,
		setHarmonicAmplitude,
		waveNumber,
	} = useWaveStore();

	return (
		<Drawer
			direction="bottom"
			modal={false}
			open={isHarmonicsDrawerOpen}
			onOpenChange={setHarmonicsDrawerOpen}
		>
			<DrawerContent className={styles.drawerContent}>
				<DrawerHeader className={styles.header}>
					<div className={styles.headerTop}>
						<DrawerTitle className={styles.title}>
							<SlidersHorizontal className={styles.titleIcon} />
							Amplitudes par harmonique
						</DrawerTitle>
						<span className={styles.count}>
							{harmonics} harmonique{harmonics !== 1 ? 's' : ''}
						</span>
					</div>
				</DrawerHeader>

				<div className={styles.list}>
					{Array.from({ length: harmonics }, (_, i) => i + 1).map(n => {
						const λn = (waveNumber / n).toFixed(3);
						const amp = harmonicAmplitudes[n] ?? 1.0;

						return (
							<div key={n} className={styles.row}>
								<div className={styles.label}>
									<span className={styles.index}>H{n}</span>
									<span className={styles.meta}>λ = {λn} nm</span>
								</div>
								<Slider
									value={[amp]}
									min={0}
									max={2}
									step={0.01}
									onValueChange={([v]) => setHarmonicAmplitude(n, v)}
									className={styles.slider}
								/>
								<span className={styles.value}>{amp.toFixed(2)}</span>
							</div>
						);
					})}
				</div>

				<DrawerFooter className={styles.footer}>
					<DrawerClose asChild>
						<Button>Fermer</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
