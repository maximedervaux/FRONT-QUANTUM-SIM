'use client';

import type { TooltipRenderProps } from 'react-joyride';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import styles from './WaveTour.module.css';

export default function WaveTourTooltip({
	backProps,
	closeProps,
	continuous,
	index,
	isLastStep,
	primaryProps,
	size,
	step,
	skipProps,
}: TooltipRenderProps) {
	return (
		<Card className={styles.tooltipCard}>
			<div className={styles.tooltipHeader}>
				<span className={styles.tooltipStep}>
					Étape {index + 1} / {size}
				</span>
				<Button variant="ghost" size="sm" {...closeProps}>
					Fermer
				</Button>
			</div>
			{step.title ? <h3 className={styles.tooltipTitle}>{step.title}</h3> : null}
			<div className={styles.tooltipBody}>{step.content}</div>
			<div className={styles.tooltipFooter}>
				<span className={styles.tooltipMeta}>
					Guide interactif de la section ondes
				</span>
				<div className={styles.tooltipActions}>
					{index > 0 ? (
						<Button variant="outline" size="sm" {...backProps}>
							Retour
						</Button>
					) : null}
					{!isLastStep ? (
						<Button variant="ghost" size="sm" {...skipProps}>
							Passer
						</Button>
					) : null}
					<Button size="sm" {...primaryProps}>
						{isLastStep ? 'Terminer' : continuous ? 'Suivant' : 'Continuer'}
					</Button>
				</div>
			</div>
		</Card>
	);
}