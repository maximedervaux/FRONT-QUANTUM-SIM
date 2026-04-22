import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forwardRef } from "react";
import Image from "next/image";
import styles from "./TechStack.module.css";

type StackItem = {
	category: string;
	title: string;
	description: string;
	logoSrc: string;
	logoAlt: string;
};

const stackItems: StackItem[] = [
	{
		category: "Python",
		title: "Python - Coeur du projet",
		description:
			"Le package principal. Toute la logique quantique - calculs d'ondes, potentiels, evolution temporelle - est implementee ici. Installable via pip et importable dans n'importe quel environnement Python.",
		logoSrc: "/assets/tech/python.svg",
		logoAlt: "Logo Python",
	},
	{
		category: "Google Colab",
		title: "Compatible Jupyter Notebooks",
		description:
			"Des notebooks educatifs pour explorer les concepts pas a pas, avec du code executable et des visualisations integrees. Ideal pour un usage en TD ou en auto-apprentissage.",
		logoSrc: "/assets/tech/colab.svg",
		logoAlt: "Logo Google Colab",
	},
	{
		category: "Simulateur Web",
		title: "Simulateur interactif (Next.js)",
		description:
			"Une interface web pour visualiser en temps reel l'evolution des ondes quantiques, accessible depuis un navigateur sans installation requise.",
		logoSrc: "/assets/next.svg",
		logoAlt: "Logo Next.js",
	},
	{
		category: "Visualisation 3D",
		title: "Three.js - Visualisation 3D",
		description:
			"Les representations tridimensionnelles (surfaces de phase, evolution temporelle, harmoniques) sont rendues avec Three.js pour une comprehension spatiale des phenomenes quantiques.",
		logoSrc: "/assets/tech/three.png",
		logoAlt: "Logo Three.js",
	},
];

const TechStack = forwardRef<HTMLDivElement>((props, ref) => {
	return (
		<section className={styles.techStack} ref={ref}>
			<div className={styles.heading}>
				<h2>Les technologies derriere le projet.</h2>
				<p>
					Une stack simple, robuste et pensee pour la communaute scientifique.
				</p>
			</div>

			<div className={styles.grid}>
				{stackItems.map((item) => (
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

TechStack.displayName = "TechStack";

export default TechStack;
