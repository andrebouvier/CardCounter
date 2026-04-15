//counting logic

export type CountReadout = {
    runningCount: number;
    trueCount?: number | null;
    decksRemaining?: number | null;
    cardsSeen?: number | null;
};

export function calculateTrueCount(runningCount: number, decksRemaining: number): number {
    return runningCount / decksRemaining;
}

//calculate the number of decks remaining based on the number of cards seen
export function calculateDecksRemaining(numberOfDecks: number, cardsSeen: number): number {
    return (((numberOfDecks * 52) - cardsSeen) / 52);
}