// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// creating channels for screen capture and sending to main process

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  main: {
    openScreenSecurity: () => ipcRenderer.invoke('electronMain:openScreenSecurity'),
    getScreenAccess: () => ipcRenderer.invoke('electronMain:getScreenAccess'),
    getScreenSources: () => ipcRenderer.invoke('electronMain:getScreenSources'),
  }

});