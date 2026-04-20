import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { useSchrodingerStore, type PotentialType } from '../../../store/schrodinger.store';

const POTENTIAL_INFO = {
	free: 'Sans potentiel',
	infiniteWell: 'Potentiel en forme de puits infini',
	step: 'Potentiel en forme de marche',
};

export default function SchrodingerParametre() {
	const { potentialType, setPotentialType } = useSchrodingerStore();

	const potentialSelect: Array<{ label: string; value: PotentialType }> = [
		{ label: 'Sans potentiel', value: 'free' },
		{ label: 'Puits infini', value: 'infiniteWell' },
		{ label: 'Marche de potentiel', value: 'step' },
	];

	return (
		<>
			<ButtonGroup>
				{potentialSelect.map(option => (
					<Button
						key={option.value}
						size="sm"
						variant={potentialType === option.value ? 'default' : 'outline'}
						onClick={() => setPotentialType(option.value)}
						aria-pressed={potentialType === option.value}
						title={POTENTIAL_INFO[option.value as keyof typeof POTENTIAL_INFO]}
					>
						{option.label}
					</Button>
				))}
			</ButtonGroup>
		</>
	);
}
