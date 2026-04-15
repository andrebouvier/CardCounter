//user configurable settings (bet spread, number of decks, etc.)
export type CountSystemId = 'zen'; //| 'hilo';

export type BetSpreadSettings = {
    minUnits: number;
    maxUnits: number;
};

export type UserRisk = 'low' | 'medium' | 'high';

export type UserSettings = {
    betSpread: BetSpreadSettings;
    bankrollSize: number;
    numberOfDecks: number;
    countSystem: CountSystemId;
    userRisk: UserRisk;
    variance: number;
};

export type CountSystemOption = {
    id: CountSystemId;
    label: string;
};

export type UserRiskOption = {
    id: UserRisk;
    label: string;
};
    
export const USER_RISK_OPTIONS: readonly UserRiskOption[] = [
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' },
];

export const COUNT_SYSTEM_OPTIONS: readonly CountSystemOption[] = [
    { id: 'zen', label: 'Zen Count' },
    //{ id: 'hilo', label: 'Hi-Lo' },
];

export const DEFAULT_USER_SETTINGS: UserSettings = {
    betSpread: { minUnits: 1, maxUnits: 12 },
    bankrollSize: 100,
    numberOfDecks: 6,
    countSystem: 'zen',
    userRisk: 'medium',
    variance: 1.346,
};