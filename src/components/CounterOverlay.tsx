import { CountDisplay } from './CountDisplay';
import { RankReference } from './RankReference';
import {
  BetSizingReadout,
  StrategyHintPanel,
  VideoPreviewPlaceholder,
} from './FutureSlots';
import { SettingsPanel } from './SettingsPanel';
import { SessionControls } from './SessionControls';
import { ZenCountButtonGrid } from './ZenCountButtonGrid';
import type { UserSettings } from '../lib/config';
import { calculateBetSpread } from '../lib/betspread';
import type { ZenTag } from '../types/counter';

export type CounterOverlayProps = {
  runningCount: number;
  trueCount?: number | null;
  decksRemaining?: number | null;
  onTag: (tag: ZenTag) => void;
  onUndo: () => void;
  onNewShoe: () => void;
  onReset?: () => void;
  canUndo?: boolean;
  disabled?: boolean;
  showRankReference?: boolean;
  settings: UserSettings;
  onSettingsChange: (next: UserSettings) => void;
};

export function CounterOverlay({
  runningCount,
  trueCount,
  decksRemaining,
  onTag,
  onUndo,
  onNewShoe,
  onReset,
  canUndo,
  disabled,
  showRankReference = true,
  settings,
  onSettingsChange,
}: CounterOverlayProps) {
  const unitBet =
    typeof trueCount === 'number'
      ? calculateBetSpread(trueCount, settings)
      : settings.betSpread.minUnits;

  return (
    <div className="counter-overlay">
      <header className="overlay-header">
        <h1 className="overlay-header__title">Zen count</h1>
        <p className="overlay-header__subtitle">Manual tags · overlay</p>
      </header>

      <SettingsPanel value={settings} onChange={onSettingsChange} />

      <CountDisplay
        runningCount={runningCount}
        trueCount={trueCount}
        decksRemaining={decksRemaining}
      />

      <ZenCountButtonGrid onTag={onTag} disabled={disabled} />

      {/* {showRankReference && <RankReference />} */}

      <SessionControls
        onUndo={onUndo}
        onNewShoe={onNewShoe}
        onReset={onReset}
        canUndo={canUndo}
        disabled={disabled}
      />

      <section className="future-section" aria-label="Coming later">
        <VideoPreviewPlaceholder />
        <BetSizingReadout unitBet={unitBet} />
        <StrategyHintPanel />
      </section>
    </div>
  );
}
