import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import styles from './TeamSection.module.css';

const members = [
	{ name: 'William PASSET' },
	{ name: 'Clement Flament' },
	{ name: 'Ugo Warembourg' },
	{ name: 'Paul CISLINI' },
	{ name: 'Lucas OLIER' },
	{ name: 'Maxime Dervaux' },
];

function getInitials(fullName: string) {
	return fullName
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map(part => part[0]?.toUpperCase() ?? '')
		.join('');
}

export default function TeamSection() {
	return (
		<section className={styles.teamSection}>
			<div className={styles.heading}>
				<h2>Une équipe d’étudiants ingénieurs au service d’un projet de recherche.</h2>
				<p>
					QuantumSim a été développé par une équipe de six étudiants en alternance à JUNIA ISEN,
					dans le cadre d’un module de Recherche & Développement. Ce projet allie rigueur
					scientifique, collaboration et volonté de rendre la physique quantique plus accessible.
				</p>
			</div>

			<div className={styles.grid}>
				<Card className={styles.card}>
					<CardHeader>
						<CardDescription>Membres de l’équipe</CardDescription>
						<CardTitle>Équipe projet</CardTitle>
					</CardHeader>
					<CardContent>
						<div className={styles.membersGrid}>
							{members.map(member => (
								<div key={member.name} className={styles.memberCard}>
									<div className={styles.memberAvatar}>{getInitials(member.name)}</div>
									<div className={styles.memberIdentity}>
										<p className={styles.memberName}>{member.name}</p>
										<p className={styles.memberRole}>Étudiant ingénieur</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card className={styles.card}>
					<CardHeader>
						<CardDescription>Encadrement</CardDescription>
						<CardTitle>Direction scientifique et pédagogique</CardTitle>
					</CardHeader>
					<CardContent className={styles.supervisionContent}>
						<div>
							<p className={styles.personName}>M. Pierre Capiod</p>
							<p>
								Enseignant-chercheur, JUNIA ISEN. Co-initiateur du projet et référent pédagogique.
							</p>
						</div>
						<Separator />
						<div>
							<p className={styles.personName}>M. David Mele</p>
							<p>
								Enseignant-chercheur, JUNIA ISEN. Initiateur du projet et encadrant scientifique.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className={styles.academicCard}>
				<CardHeader>
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
					<p>Projet développé dans le cadre du module R&D - JUNIA ISEN. Année 2025-2026.</p>
				</CardContent>
			</Card>
		</section>
	);
}
