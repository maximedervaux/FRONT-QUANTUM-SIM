import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { forwardRef } from 'react';
import Image from 'next/image';
import styles from './TechStack.module.css';

type StackItem = {
	category: string;
	title: string;
	description: string;
	logoSrc: string;
	logoAlt: string;
};

const stackItems: StackItem[] = [
	{
		category: 'Python',
		title: 'Python - Coeur du projet',
		description:
			'Package principal contenant toute la logique quantique (calculs d’ondes, potentiels, évolution temporelle). Il est utilisé côté frontend via Pyodide, ce qui rend l’application entièrement sans backend dédié.',
		logoSrc: '/assets/tech/python.svg',
		logoAlt: 'Logo Python',
	},
	{
		category: 'Google Colab',
		title: 'Compatible Jupyter Notebooks',
		description:
			'Des notebooks éducatifs permettant d’explorer les concepts pas à pas, avec du code exécutable et des visualisations intégrées. Idéal pour les TD ou l’auto-apprentissage.',
		logoSrc: '/assets/tech/colab.svg',
		logoAlt: 'Logo Google Colab',
	},
	{
		category: 'Simulateur Web',
		title: 'Simulateur interactif (Next.js)',
		description:
			'Une interface web permettant de visualiser en temps réel l’évolution des ondes quantiques, directement depuis un navigateur, sans installation requise.',
		logoSrc: '/assets/next.svg',
		logoAlt: 'Logo Next.js',
	},
	{
		category: 'Visualisation 3D',
		title: 'Three.js - Visualisation 3D',
		description:
			'Les représentations tridimensionnelles (surfaces de phase, évolution temporelle, harmoniques) sont rendues avec Three.js afin de faciliter la compréhension spatiale des phénomènes quantiques.',
		logoSrc: '/assets/tech/three.png',
		logoAlt: 'Logo Three.js',
	},
];

const TechStack = forwardRef<HTMLDivElement>((props, ref) => {
	return (
		<section className={styles.techStack} ref={ref}>
			<div className={styles.heading}>
				<h2>Les technologies derriere le projet.</h2>
				<p>Une stack simple, robuste et pensée pour la communauté scientifique.</p>
			</div>

			<div className={styles.grid}>
				{stackItems.map(item => (
					<Card key={item.title} className={styles.card}>
						<CardHeader>
							<div className={styles.cardTop}>
								<div className={styles.logoWrapper}>
									<Image src={item.logoSrc} alt={item.logoAlt} width={28} height={28} />
								</div>
								<CardDescription>{item.category}</CardDescription>
							</div>
							<CardTitle>{item.title}</CardTitle>
						</CardHeader>
						<CardContent>
							<p>{item.description}</p>
						</CardContent>
					</Card>
				))}
			</div>
		</section>
	);
});

TechStack.displayName = 'TechStack';

export default TechStack;
