export type VideoPreviewPlaceholderProps = {
  label?: string;
  onVideoPreviewPlaceholderClick?: () => void;
};

export function VideoPreviewPlaceholder({
  label = 'Screen Detect',
  onVideoPreviewPlaceholderClick,
}: VideoPreviewPlaceholderProps) {
  return (
    <button
      className="future-stub video-preview-placeholder"
      type="button"
      onClick={() => onVideoPreviewPlaceholderClick?.()}
      aria-label={label}
    >
      <div className="future-stub__label">{label}</div>
      <div className="future-stub__value">Video feed placeholder</div>
    </button>
  );
}

export type BetSizingReadoutProps = {
  /** e.g. "2" or "—" when unknown */
  unitBet?: number;
};

export function BetSizingReadout({ unitBet }: BetSizingReadoutProps) {
  return (
    <div className="future-stub" aria-hidden="true">
      <div className="future-stub__label">Bet sizing</div>
      <div className="future-stub__value">Units: {unitBet}</div>
    </div>
  );
}

export type StrategyHintPanelProps = {
  actionText?: string;
};

export function StrategyHintPanel({
  actionText = '—',
}: StrategyHintPanelProps) {
  return (
    <div className="future-stub" aria-hidden="true">
      <div className="future-stub__label">Best action</div>
      <div className="future-stub__value">Action: {actionText}</div>
    </div>
  );
}
