import { useCallback, useEffect, useRef, useReducer, useState } from 'react';

import { CounterOverlay } from './components/CounterOverlay';
import { getVideoSources, type ScreenSource } from './classification/videoCapture';
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
  const [sourcePickerOptions, setSourcePickerOptions] = useState<ScreenSource[] | null>(
    null,
  );
  const pickerResolveRef = useRef<((sourceId: string | null) => void) | null>(null);
  const previewWindowRef = useRef<Window | null>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);
  const cardsSeen = session.history.length;
  const decksRemainingRaw = calculateDecksRemaining(settings.numberOfDecks, cardsSeen);
  const decksRemaining = decksRemainingRaw > 0 ? decksRemainingRaw : 0;
  const trueCount =
    decksRemaining > 0
      ? calculateTrueCount(session.runningCount, decksRemaining)
      : null;

  useEffect(() => {
    return () => {
      previewStreamRef.current?.getTracks().forEach((track) => track.stop());
      previewStreamRef.current = null;
      previewWindowRef.current?.close();
      previewWindowRef.current = null;
    };
  }, []);

  const openPreviewWindow = useCallback((stream: MediaStream) => {
    previewStreamRef.current?.getTracks().forEach((track) => track.stop());
    previewStreamRef.current = stream;

    const previewWindow =
      previewWindowRef.current && !previewWindowRef.current.closed
        ? previewWindowRef.current
        : window.open('', 'cv-capture-preview', 'width=1200,height=720');

    if (!previewWindow) {
      throw new Error('Unable to open preview window.');
    }

    previewWindowRef.current = previewWindow;
    previewWindow.document.title = 'Capture Preview';
    previewWindow.document.body.style.margin = '0';
    previewWindow.document.body.style.background = '#000';
    previewWindow.document.body.style.display = 'grid';
    previewWindow.document.body.style.placeItems = 'center';

    let videoEl = previewWindow.document.getElementById(
      'capture-preview-video',
    ) as HTMLVideoElement | null;

    if (!videoEl) {
      videoEl = previewWindow.document.createElement('video');
      videoEl.id = 'capture-preview-video';
      videoEl.autoplay = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.style.maxWidth = '100vw';
      videoEl.style.maxHeight = '100vh';
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoEl.style.objectFit = 'contain';
      previewWindow.document.body.replaceChildren(videoEl);
    }

    videoEl.srcObject = stream;
    void videoEl.play();
    previewWindow.focus();
  }, []);

  const onTag = useCallback((tag: ZenTag) => {
    dispatch({ type: 'tag', tag });
  }, []);

  const onUndo = useCallback(() => {
    dispatch({ type: 'undo' });
  }, []);

  const onNewShoe = useCallback(() => {
    dispatch({ type: 'newShoe' });
  }, []);

  const onScreenDetect = useCallback(async () => {
    try {
      const stream = await getVideoSources(async (sources: ScreenSource[]) => {
        return await new Promise<string | null>((resolve) => {
          pickerResolveRef.current = resolve;
          setSourcePickerOptions(sources);
        });
      });
      openPreviewWindow(stream);
      console.log('Screen capture started', stream);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Screen source selection was cancelled.'
      ) {
        return;
      }
      console.error('Failed to start screen capture:', error);
      window.alert(
        'Screen capture failed. Check the console and verify app permissions/startup.',
      );
    }
  }, [openPreviewWindow]);

  const onChooseScreenSource = useCallback((sourceId: string | null) => {
    pickerResolveRef.current?.(sourceId);
    pickerResolveRef.current = null;
    setSourcePickerOptions(null);
  }, []);

  return (
    <>
      <CounterOverlay
        runningCount={session.runningCount}
        trueCount={trueCount}
        decksRemaining={decksRemaining}
        onTag={onTag}
        onUndo={onUndo}
        onNewShoe={onNewShoe}
        onScreenDetect={() => {
          void onScreenDetect();
        }}
        canUndo={session.history.length > 0}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {sourcePickerOptions ? (
        <div className="source-picker">
          <div className="source-picker__panel">
            <h2 className="source-picker__title">Choose Screen Source</h2>
            <p className="source-picker__subtitle">Select a window or screen preview.</p>
            {sourcePickerOptions.map((source) => (
              <button
                key={source.id}
                type="button"
                onClick={() => onChooseScreenSource(source.id)}
                className="source-picker__item"
              >
                <img
                  src={source.thumbnailURL}
                  alt={source.name}
                  className="source-picker__image"
                />
                <div className="source-picker__name" title={source.name}>
                  {source.name}
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => onChooseScreenSource(null)}
              className="source-picker__cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
