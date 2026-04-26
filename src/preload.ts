// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// creating channels for screen capture and sending to main process

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  main: {
    openScreenSecurity: () => ipcRenderer.invoke('electronMain:openScreenSecurity'),
    getScreenAccess: () => ipcRenderer.invoke('electronMain:getScreenAccess'),
    getScreenSources: () => ipcRenderer.invoke('electronMain:getScreenSources'),

    //start connection to websocket when window capture is started
    captureStart: () => ipcRenderer.invoke('capture:start'),
    captureStop: () => ipcRenderer.invoke('capture:stop'),

    //send frames to websocket for processing
    sendFrame: (frame: Uint8Array) => ipcRenderer.invoke('capture:sendFrame', frame),

    //open and close window for processed frames
    openProcessWindow: () => ipcRenderer.invoke('capture:openProcessWindow'),
    closeProcessWindow: () => ipcRenderer.invoke('capture:closeProcessWindow'),

    //receive processed frames
    onProcessedFrame: (cb: (frame: Uint8Array) => void) => {
      const listener = (_event: unknown, frame: Uint8Array) => cb(frame);
      ipcRenderer.on('capture:processedFrame', listener);
      return () => ipcRenderer.removeListener('capture:processedFrame', listener);
    }
  }
});