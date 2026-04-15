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
      <div className="count-display__row">
        <div className="count-display__metric">
          <div className="count-display__label">True count</div>
          <div className="count-display__value">
            {showTrue ? Number(trueCount).toFixed(1) : '—'}
          </div>
        </div>
        <div className="count-display__metric">
          <div className="count-display__label">Running count</div>
          <div className="count-display__value">{runningCount}</div>
        </div>
      </div>
      {(showTrue || showDecks) && (
        <div className="count-display__meta">
          {showDecks && <span>Decks left: {Number(decksRemaining).toFixed(2)}</span>}
        </div>
      )}
    </div>
  );
}
