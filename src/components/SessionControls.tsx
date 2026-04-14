export type SessionControlsProps = {
  onUndo: () => void;
  onNewShoe: () => void;
  onReset?: () => void;
  canUndo?: boolean;
  disabled?: boolean;
};

export function SessionControls({
  onUndo,
  onNewShoe,
  onReset,
  canUndo = true,
  disabled,
}: SessionControlsProps) {
  return (
    <div className="session-controls" role="toolbar" aria-label="Session">
      <button
        type="button"
        onClick={onUndo}
        disabled={disabled || !canUndo}
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onNewShoe}
        disabled={disabled}
      >
        New shoe
      </button>
      {onReset && (
        <button
          type="button"
          className="session-controls__danger"
          onClick={onReset}
          disabled={disabled}
        >
          Reset
        </button>
      )}
    </div>
  );
}
