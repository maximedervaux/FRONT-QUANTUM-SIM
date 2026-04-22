'use client';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { usePlaneWavesData } from '../../../hooks/usePlaneWavesData';
import styles from './Chart.module.css';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

function Chart() {
	const { plotData, plotLayout } = usePlaneWavesData();

	return (
		<div className={styles.chart}>
			<Plot
				data={plotData}
				layout={plotLayout}
				style={{ width: '100%', height: '100%', overflow: 'hidden' }}
				config={{ responsive: true, displayModeBar: true }}
			/>
		</div>
	);
}

export default memo(Chart);
