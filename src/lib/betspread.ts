//Calculate the bet spread based on the true count
//TODO: double check edge calculation and kelly sizing

import { UserSettings } from './config';

export type UserRisk = 'low' | 'medium' | 'high';
export function calculateZenTrueEdge(runningCount: number, remainingDecks: number): number {
    return (runningCount / remainingDecks) * 4;
}

export function calculateZenBetSpread(runningCount: number, remainingDecks: number, settings: UserSettings): number {
    const edge = calculateZenTrueEdge(runningCount, remainingDecks);
    if (edge <= 0) {
        return settings.betSpread.minUnits;
    }
    const { minUnits, maxUnits } = settings.betSpread;
    const bankrollSize = Math.max(settings.bankrollSize, 1);
    const variance = Math.max(settings.variance, 0.0001);
    const risk: UserRisk = settings.userRisk;
    
    const kellyFactorRiskMap: Record<UserRisk, number> = {
        low: 0.25,
        medium: 0.5,
        high: 1,
    };
    const kellyMultiplier = kellyFactorRiskMap[risk];
    const kellyBet = (edge / variance) * kellyMultiplier * bankrollSize;
    const betUnits = Math.round(kellyBet);

    return Math.min(Math.max(betUnits, minUnits), maxUnits);
}