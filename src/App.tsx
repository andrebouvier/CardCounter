import { useCallback, useReducer, useState } from 'react';

import { CounterOverlay } from './components/CounterOverlay';
import { calculateDecksRemaining, calculateTrueCount } from './lib/counting';
import { DEFAULT_USER_SETTINGS, type UserSettings } from './lib/config';
import { zenRunningDelta, type ZenTag } from './types/counter';

type SessionState = {
  runningCount: number;
  history: ZenTag[];
};

type SessionAction =
  | { type: 'tag'; tag: ZenTag }
  | { type: 'undo' }
  | { type: 'newShoe' };

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'tag': {
      const delta = zenRunningDelta(action.tag);
      return {
        runningCount: state.runningCount + delta,
        history: [...state.history, action.tag],
      };
    }
    case 'undo': {
      if (state.history.length === 0) {
        return state;
      }
      const last = state.history[state.history.length - 1];
      return {
        runningCount: state.runningCount - zenRunningDelta(last),
        history: state.history.slice(0, -1),
      };
    }
    case 'newShoe':
      return { runningCount: 0, history: [] };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

const initialSession: SessionState = { runningCount: 0, history: [] };

export function App() {
  const [session, dispatch] = useReducer(sessionReducer, initialSession);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const cardsSeen = session.history.length;
  const decksRemainingRaw = calculateDecksRemaining(settings.numberOfDecks, cardsSeen);
  const decksRemaining = decksRemainingRaw > 0 ? decksRemainingRaw : 0;
  const trueCount =
    decksRemaining > 0
      ? calculateTrueCount(session.runningCount, decksRemaining)
      : null;

  const onTag = useCallback((tag: ZenTag) => {
    dispatch({ type: 'tag', tag });
  }, []);

  const onUndo = useCallback(() => {
    dispatch({ type: 'undo' });
  }, []);

  const onNewShoe = useCallback(() => {
    dispatch({ type: 'newShoe' });
  }, []);

  return (
    <CounterOverlay
      runningCount={session.runningCount}
      trueCount={trueCount}
      decksRemaining={decksRemaining}
      onTag={onTag}
      onUndo={onUndo}
      onNewShoe={onNewShoe}
      canUndo={session.history.length > 0}
      settings={settings}
      onSettingsChange={setSettings}
    />
  );
}
