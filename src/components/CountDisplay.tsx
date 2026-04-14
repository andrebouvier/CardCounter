export type CountDisplayProps = {
  runningCount: number;
  trueCount?: number | null;
  decksRemaining?: number | null;
};

export function CountDisplay({
  runningCount,
  trueCount,
  decksRemaining,
}: CountDisplayProps) {
  const showTrue = trueCount != null && !Number.isNaN(trueCount);
  const showDecks = decksRemaining != null && !Number.isNaN(decksRemaining);

  return (
    <div className="count-display">
      <div className="count-display__label">Running count</div>
      <div className="count-display__value">{runningCount}</div>
      {(showTrue || showDecks) && (
        <div className="count-display__meta">
          {showTrue && <span>True: {Number(trueCount).toFixed(1)}</span>}
          {showDecks && <span>Decks left: {Number(decksRemaining).toFixed(2)}</span>}
        </div>
      )}
    </div>
  );
}
