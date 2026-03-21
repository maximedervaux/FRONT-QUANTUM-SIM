'use client';
import { Button } from '@/components/ui/button';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function CodeButton() {
	const title = 'pip install quantum-sim-library';

	/**
	 * Copy command to install quantum-sim-library
	 * @returns Function to copy title
	 */
	const copy = () => {
		return () => {
			navigator.clipboard.writeText(title);
			toast('Copié dans votre presse-papier !');
		};
	};

	return (
		<Button className="code-button" onClick={copy()}>
			{title}
			<CopyIcon />
		</Button>
	);
}
