export interface ScreenSource {
  id: string;
  name: string;
  display_id?: string;
  thumbnailURL: string;
}

type PickerFn = (sources: ScreenSource[]) => Promise<string | null>;

declare global {
  interface Window {
    electronApi: {
      main: {
        getScreenAccess: () => Promise<boolean>;
        getScreenSources: () => Promise<ScreenSource[]>;
      };
    };
  }
}

export async function getVideoSources(pickSource: PickerFn): Promise<MediaStream> {
  
  const hasAccess = await window.electronApi.main.getScreenAccess();
  if (!hasAccess) {
    throw new Error('Screen capture permission is not granted.');
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

  return window.navigator.mediaDevices.getUserMedia(constraints);
}

export async function sendFrame(stream: MediaStream, frame: Uint8Array): Promise<void> {
  
}