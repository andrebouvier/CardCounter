export interface ScreenSource {
  id: string;
  name: string;
  display_id?: string;
  thumbnailURL: string;
}

type PickerFn = (sources: ScreenSource[]) => Promise<string | null>;
type ScreenAccessStatus = 'granted' | 'denied' | 'restricted' | 'not-determined' | 'unknown';

declare global {
  interface Window {
    electronApi: {
      main: {
        getScreenAccess: () => Promise<ScreenAccessStatus>;
        getScreenSources: () => Promise<ScreenSource[]>;
        captureStart: () => Promise<void>;
        captureStop: () => Promise<void>;
        closeProcessWindow: () => Promise<void>;
        openProcessWindow: () => Promise<void>;
        sendFrame: (frame: Uint8Array) => Promise<void>;
        onProcessedFrame: (cb: (frame: Uint8Array) => void) => () => void;
      };
    };
  }
}

export async function getVideoSources(pickSource: PickerFn): Promise<MediaStream> {
  
  const accessStatus = await window.electronApi.main.getScreenAccess();
  if (accessStatus !== 'granted') {
    if (accessStatus === 'denied' || accessStatus === 'restricted') {
      throw new Error('Screen capture permission is denied. Enable it in system settings.');
    }
    throw new Error(`Screen capture permission is not granted (status: ${accessStatus}).`);
  }

  const sources = await window.electronApi.main.getScreenSources();
  if (!sources.length) {
    throw new Error('No capturable sources were found.');
  }

  const selectedSourceId = await pickSource(sources);
  if (!selectedSourceId) {
    throw new Error('Screen source selection was cancelled.');
  }

  const selectedSource = sources.find((source) => source.id === selectedSourceId);
  if (!selectedSource) {
    throw new Error('Selected screen source was not found.');
  }

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: selectedSource.id,
      },
    },
  } as MediaStreamConstraints;
  //connect to websocket
  await window.electronApi.main.captureStart();
  return window.navigator.mediaDevices.getUserMedia(constraints);
}

//send frame to websocket
export async function sendFrame(frame: Uint8Array): Promise<void> {
  await window.electronApi.main.sendFrame(frame);
}
