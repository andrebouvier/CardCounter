//user configurable settings (bet spread, number of decks, etc.)
export type CountSystemId = 'zen'; //| 'hilo';

export type BetSpreadSettings = {
    minUnits: number;
    maxUnits: number;
};

export type UserSettings = {
    betSpread: BetSpreadSettings;
    numberOfDecks: number;
    countSystem: CountSystemId;
};

export type CountSystemOption = {
    id: CountSystemId;
    label: string;
};

export const COUNT_SYSTEM_OPTIONS: readonly CountSystemOption[] = [
    { id: 'zen', label: 'Zen Count' },
    //{ id: 'hilo', label: 'Hi-Lo' },
];

export const DEFAULT_USER_SETTINGS: UserSettings = {
    betSpread: { minUnits: 1, maxUnits: 12 },
    numberOfDecks: 6,
    countSystem: 'zen',
};