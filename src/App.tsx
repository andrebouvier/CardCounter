import { useCallback, useEffect, useRef, useReducer, useState } from 'react';

import { CounterOverlay } from './components/CounterOverlay';
import { getVideoSources, sendFrame, type ScreenSource } from './classification/videoCapture';
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
  const isProcessedWindow = new URLSearchParams(window.location.search).get('processed') === '1';
  const trueCount =
    decksRemaining > 0
      ? calculateTrueCount(session.runningCount, decksRemaining)
      : null;

  useEffect(() => {
    return () => {
      previewStreamRef.current?.getTracks().forEach((track) => track.stop());
      previewStreamRef.current = null;
      void window.electronApi.main.captureStop();
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
    previewWindow.onbeforeunload = () => {
      previewStreamRef.current?.getTracks().forEach((track) => track.stop());
      previewStreamRef.current = null;
      void window.electronApi.main.captureStop();
      //close window for processed frames
      void window.electronApi.main.closeProcessWindow();
      previewWindowRef.current = null;
    };
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

  const frameLoopStopRef = useRef<(() => void) | null>(null);

  const startFrameLoop = useCallback((stream: MediaStream) => {
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stopped = false;
    let sending = false;
    const intervals = 100; //10 FPS
    let lastSent = 0;
    let rafId = 0;

    const stop = () => {
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
    }; 

    frameLoopStopRef.current?.();
    frameLoopStopRef.current = stop;
    track.addEventListener('ended', stop);

    void video.play().then(() => {
      const tick = () => {
        if (stopped) return;

        rafId = requestAnimationFrame(tick);
        if (video.videoWidth === 0 || video.videoHeight === 0) return;
        const now = performance.now();
        if (now - lastSent < intervals || sending) return;
        lastSent = now;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        sending = true;
        canvas.toBlob(async (blob) => {
          try {
            if (!blob || stopped) return;
            const buffer = await blob.arrayBuffer();
            const frame = new Uint8Array(buffer);
            // either call your helper:
            // await sendFrame(stream, frame);
            // or call preload directly:
            await sendFrame(frame);
          } catch (err) {
            console.error('Frame send failed', err);
          } finally {
            sending = false;
          }
        }, 'image/jpeg', 0.7);
      };
      tick();
    }).catch((err) => {
      console.error('Video play failed for frame loop', err);
    });
  }, []);

  //render the processed frames
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isProcessedWindow) return;

    const unsubscribe = window.electronApi.main.onProcessedFrame((frame: Uint8Array) => {
      const safeBytes = frame.slice();
      const blob = new Blob([safeBytes], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);

      const processedImage = document.getElementById('processed-image') as HTMLImageElement | null;
      if (processedImage) {
        processedImage.src = url;
      }

      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
      lastUrlRef.current = url;
    });

    return () => {
      unsubscribe?.();
      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
    };  
  }, [isProcessedWindow]);

  const onScreenDetect = useCallback(async () => {
    try {
      const stream = await getVideoSources(async (sources: ScreenSource[]) => {
        return await new Promise<string | null>((resolve) => {
          pickerResolveRef.current = resolve;
          setSourcePickerOptions(sources);
        });
      });
      openPreviewWindow(stream);

      //open window for processed frames
      void window.electronApi.main.openProcessWindow();

      //send frame to websocket
      startFrameLoop(stream);
      
      //disconnect from websocket
      const capture = stream.getVideoTracks()[0];
      if (capture) {
        capture.addEventListener('ended', () => {
          void window.electronApi.main.captureStop();
        });
      }

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

  if (isProcessedWindow) {
    return (
      <div style={{ margin: 0, background: '#000', width: '100vw', height: '100vh' }}>
        <img
          id="processed-image"
          alt="Processed stream"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

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
