'use client';
import Link from 'next/link';

import styles from './styles/style.module.css';
import DashBoard from './components/DashBoard/DashBoard';
import { PythonWorkerProvider } from '../core/contexts/PythonWorkerContext';
import { NavigationTabs } from './components/MenuBar/NaviguationBar';
import 'katex/dist/katex.min.css';
import MobileWarning from './components/MobileWarning/MobileWarning';
import Image from 'next/image';
export default function Simulateur() {
	return (
		<>
			<MobileWarning />
			<PythonWorkerProvider>
				<div className={styles.simulatorRoot}>
					<div className={styles.content}>
						<div className={styles.headerBar}>
							<Link href="/">
								<Image
									src="/assets/logo.png"
									alt="Quantum Sim Logo"
									width={120}
									height={40}
									loading="eager"
									style={{ height: 'auto' }}
								/>
							</Link>
							<NavigationTabs />
						</div>

						<DashBoard />
					</div>
				</div>
			</PythonWorkerProvider>
		</>
	);
}
