import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import styles from "./TeamSection.module.css";

const members = [
	{ name: "William PASSET" },
	{ name: "Clement Flament" },
	{ name: "Ugo Warembourg" },
	{ name: "Paul CISLINI" },
	{ name: "Lucas OLIER" },
	{ name: "Maxime Dervaux" },
];

function getInitials(fullName: string) {
	return fullName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

export default function TeamSection() {
	return (
		<section className={styles.teamSection}>
			<div className={styles.heading}>
				<h2>Une equipe d'etudiants ingenieurs, un projet de recherche.</h2>
				<p>
					QuantumSim a ete developpe par une equipe de six etudiants en alternance a JUNIA ISEN,
					dans le cadre d'un module de Recherche & Developpement. Un projet melant rigueur
					scientifique, travail collaboratif et envie de rendre la physique quantique accessible.
				</p>
			</div>

			<div className={styles.grid}>
				<Card className={styles.card}>
					<CardHeader>
						<CardDescription>Membres de l'equipe</CardDescription>
						<CardTitle>Equipe projet</CardTitle>
					</CardHeader>
					<CardContent>
						<div className={styles.membersGrid}>
							{members.map((member) => (
								<div key={member.name} className={styles.memberCard}>
									<div className={styles.memberAvatar}>{getInitials(member.name)}</div>
									<div className={styles.memberIdentity}>
										<p className={styles.memberName}>{member.name}</p>
										<p className={styles.memberRole}>Etudiant ingenieur</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card className={styles.card}>
					<CardHeader>
						<CardDescription>Encadrement</CardDescription>
						<CardTitle>Direction scientifique et pedagogique</CardTitle>
					</CardHeader>
					<CardContent className={styles.supervisionContent}>
						<div>
							<p className={styles.personName}>Mr. Capiod</p>
							<p>
								Enseignant-chercheur, JUNIA ISEN. Initiateur du projet et encadrant
								scientifique.
							</p>
						</div>
						<Separator />
						<div>
							<p className={styles.personName}>Mr. David Mele</p>
							<p>
								Enseignant-chercheur, JUNIA ISEN. Co-initiateur du projet et referent
								pedagogique.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className={styles.academicCard}>
				<CardHeader>
					<CardDescription>Mention academique</CardDescription>
					<CardTitle>Module R&D - JUNIA ISEN</CardTitle>
				</CardHeader>
				<CardContent className={styles.academicContent}>
					<Image
						src="/assets/JUNIA_logo.png"
						alt="JUNIA ISEN"
						width={196}
						height={64}
						className={styles.academicLogo}
					/>
					<p>Projet developpe dans le cadre du module R&D - JUNIA ISEN . Annee universitaire 2024-2025.</p>
				</CardContent>
			</Card>
		</section>
	);
}
