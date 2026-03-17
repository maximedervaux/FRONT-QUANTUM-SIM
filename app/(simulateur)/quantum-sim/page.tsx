'use client';
import Link from 'next/link';

import './styles/style.css';
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
				<div className="simulatorRoot">
					<div className="content">
						<div className="headerBar">
							<Link href="/">
								<Image src="/assets/logo.png" alt="Quantum Sim Logo" width={120} height={40} />
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
