import { app, BrowserWindow, desktopCapturer, ipcMain, systemPreferences } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.export const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// util for screen capture
const util = require('electron-util');
const Path = require('path');

//handlers for screen capture
ipcMain.handle('electronMain:openScreenSecurity', () => util.openSystemPreferences('security', 'Privacy_ScreenCapture'));
ipcMain.handle('electronMain:getScreenAccess', () => systemPreferences.getMediaAccessStatus('screen'));
ipcMain.handle('electronMain:getScreenSources', () => {
  return desktopCapturer.getSources({ types: ['window']}).then(async sources => {
    return sources.map(source => {
      return {
        id: source.id,
        name: source.name,
        display_id: source.display_id,
        thumbnailURL: source.thumbnail.toDataURL(),
      };
    })
  });
});

//Testing WebSocket connection
function testWebSocket(): Promise<string> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://127.0.0.1:8000')

    ws.onopen = () => {
      ws.send('Hello from preload.ts')
    };

    ws.onmessage = (event) => {
      resolve(String(event.data))
      ws.close();
    }

    ws.onerror = () => reject(new Error('WebSocket error'))
  });
}

async function testWebSocketRetry(maxRetries = 20, delayMs = 250, disconnectOnConnect = true): Promise<WebSocket> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const socket = await new Promise<WebSocket>((resolve, reject) => {
        const s = new WebSocket('ws://127.0.0.1:8000')
        s.onopen = () => resolve(s)
        s.onerror = () => reject(new Error('connection error'));
      });
      console.log('Electron connect to websocket');
      socket.onclose = () => {
        console.log('WebSocket closed');
      };
      socket.onerror = () => {
        console.log('WebSocket error');
      };
      if (disconnectOnConnect) {
        console.log('Disconnecting from websocket');
        socket.close();
      }
      return socket;
    } catch {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('WebSocket connection failed');
}

let processedWindow: BrowserWindow | null = null;

function openProcessWindow() {
  if (!processedWindow) {
    processedWindow = new BrowserWindow({
      width: 1200,
      height: 720,
      webPreferences: {preload: path.join(__dirname, 'preload.js')},
    });
    processedWindow.on('closed', () => {
      processedWindow = null;
    });
  }
}

// const reply = testWebSocket()
// console.log(reply);

let pyProc = null;
let pyPort = null;

const createPyProc = () => {
  const port = 8000

  pyProc = null;
  try {
    var spawn = require('child_process').spawn;
    //pyProc = spawn('python', ['server.py', port]);

    const pyScript = path.join(app.getAppPath(), 'src', 'server.py');
    const pyCwd = path.dirname(pyScript);

    pyProc = spawn('py', [pyScript], {cwd: pyCwd})


    pyProc.on('error', (error) => {
      console.log(error);
    });
    pyProc.on('close', (code) => {
      console.log(`Python process exited with code ` + code);
    });

    if (pyProc != null) {
      console.log('child process success on port ' + port)
    }
  }
  catch (error) {
    console.log(error);
  }
  testWebSocketRetry(20, 250, true).then(socket => {
    console.log('PyProcess was successfully started');
  }).catch(error => {
    console.log('Electron failed to connect to websocket', error);
  });
}

const exitPyProc = () => {
  pyProc.kill()
  pyProc = null
  pyPort = null
}

app.on('ready', createPyProc)
app.on('will-quit', exitPyProc)

// IPC handler to only connect when window capture is on
let ws: WebSocket | null = null;

ipcMain.handle('capture:start', async () => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    ws = await testWebSocketRetry(20, 250, false);
    ws.send('handshake');
  }
  return { ok: true };
});

ipcMain.handle('capture:stop', async () => {
  if (ws) {
    console.log('Disconnecting from websocket');
    ws.close();
    ws = null;
  }
  return { ok: true };
});

//ipcMain.handle('capture:sendFrame', async (event, frame: Uint8Array) => {}

ipcMain.handle('capture:openProcessWindow', () => { 
  openProcessWindow();
  return { ok: true };
});

ipcMain.handle('capture:closeProcessWindow', () => {
  processedWindow?.close();
  processedWindow = null;
  return { ok: true };
});
