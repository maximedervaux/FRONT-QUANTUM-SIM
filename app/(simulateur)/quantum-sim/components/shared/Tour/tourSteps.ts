import type { ReactNode } from 'react';
import type { Placement, Step } from 'react-joyride';

export interface TourStepDefinition {
	target: string;
	title: string;
	content: ReactNode;
	placement?: Step['placement'];
}

export function toJoyrideSteps(stepDefinitions: TourStepDefinition[]): Step[] {
	return stepDefinitions.map(step => ({
		...step,
		skipBeacon: true,
	}));
}

export function getExistingStepDefinitions(
	stepDefinitions: TourStepDefinition[]
): TourStepDefinition[] {
	if (typeof document === 'undefined') {
		return stepDefinitions;
	}

	return stepDefinitions.filter(step => Boolean(document.querySelector(step.target)));
}

export function getFirstExistingTarget(stepDefinitions: TourStepDefinition[]): string | null {
	const existing = getExistingStepDefinitions(stepDefinitions);
	return existing.length > 0 ? existing[0].target : null;
}
