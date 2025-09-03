import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MultiAgentDesktopApp {
  constructor() {
    this.mainWindow = null;
    this.serverProcess = null;
    this.isDev = process.argv.includes('--dev');
  }

  createWindow() {
    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      icon: path.join(__dirname, '../assets/icon.png'),
      titleBarStyle: 'default',
      show: false
    });

    // Load the app
    if (this.isDev) {
      this.mainWindow.loadURL('http://localhost:3001');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  createMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Project',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow.webContents.send('menu-new-project');
            }
          },
          {
            label: 'Open Data Source',
            accelerator: 'CmdOrCtrl+O',
            click: async () => {
              const result = await dialog.showOpenDialog(this.mainWindow, {
                properties: ['openFile'],
                filters: [
                  { name: 'Data Files', extensions: ['csv', 'xlsx', 'xls', 'json'] },
                  { name: 'All Files', extensions: ['*'] }
                ]
              });

              if (!result.canceled) {
                this.mainWindow.webContents.send('file-opened', result.filePaths[0]);
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Export Results',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              this.mainWindow.webContents.send('menu-export');
            }
          },
          { type: 'separator' },
          {
            role: 'quit'
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Dashboard',
            accelerator: 'CmdOrCtrl+1',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', 'dashboard');
            }
          },
          {
            label: 'Data Connectors',
            accelerator: 'CmdOrCtrl+2',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', 'connectors');
            }
          },
          {
            label: 'Agent Workflow',
            accelerator: 'CmdOrCtrl+3',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', 'workflow');
            }
          },
          {
            label: 'Analytics',
            accelerator: 'CmdOrCtrl+4',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', 'analytics');
            }
          },
          { type: 'separator' },
          {
            label: 'Toggle Full Screen',
            accelerator: 'F11',
            click: () => {
              this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
            }
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: 'F12',
            click: () => {
              this.mainWindow.webContents.toggleDevTools();
            }
          }
        ]
      },
      {
        label: 'Agents',
        submenu: [
          {
            label: 'Start All Agents',
            click: () => {
              this.mainWindow.webContents.send('agents-start-all');
            }
          },
          {
            label: 'Stop All Agents',
            click: () => {
              this.mainWindow.webContents.send('agents-stop-all');
            }
          },
          { type: 'separator' },
          {
            label: 'Data Loader Status',
            click: () => {
              this.mainWindow.webContents.send('agent-status', 'dataLoader');
            }
          },
          {
            label: 'Data Structuring Status',
            click: () => {
              this.mainWindow.webContents.send('agent-status', 'dataStructuring');
            }
          },
          {
            label: 'Graph Modeling Status',
            click: () => {
              this.mainWindow.webContents.send('agent-status', 'graphModeling');
            }
          }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Documentation',
            click: () => {
              shell.openExternal('https://github.com/your-repo/docs');
            }
          },
          {
            label: 'About',
            click: () => {
              dialog.showMessageBox(this.mainWindow, {
                type: 'info',
                title: 'About Multi-Agent Data System',
                message: 'Multi-Agent Data System v1.0.0',
                detail: 'A powerful desktop application for data processing and analysis using multi-agent systems.'
              });
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  startServer() {
    if (this.isDev) {
      // In development, assume server is already running
      return;
    }

    const serverPath = path.join(__dirname, '../src/index.js');
    this.serverProcess = spawn('node', [serverPath], {
      stdio: 'pipe'
    });

    this.serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });

    this.serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });

    this.serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });
  }

  setupIPC() {
    // Handle file operations
    ipcMain.handle('open-file-dialog', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'Data Files', extensions: ['csv', 'xlsx', 'xls', 'json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      return result.canceled ? null : result.filePaths[0];
    });

    ipcMain.handle('save-file-dialog', async (event, defaultPath) => {
      const result = await dialog.showSaveDialog(this.mainWindow, {
        defaultPath,
        filters: [
          { name: 'JSON', extensions: ['json'] },
          { name: 'CSV', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      return result.canceled ? null : result.filePath;
    });

    // Handle server communication
    ipcMain.handle('api-request', async (event, { method, endpoint, data }) => {
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined
        });

        return await response.json();
      } catch (error) {
        throw new Error(`API request failed: ${error.message}`);
      }
    });

    // Handle file upload
    ipcMain.handle('upload-file', async (event, filePath) => {
      try {
        const FormData = (await import('form-data')).default;
        const fetch = (await import('node-fetch')).default;
        
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        const response = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: form
        });

        return await response.json();
      } catch (error) {
        throw new Error(`File upload failed: ${error.message}`);
      }
    });
  }

  async initialize() {
    await app.whenReady();
    
    this.createWindow();
    this.createMenu();
    this.setupIPC();
    this.startServer();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    app.on('window-all-closed', () => {
      if (this.serverProcess) {
        this.serverProcess.kill();
      }
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('before-quit', () => {
      if (this.serverProcess) {
        this.serverProcess.kill();
      }
    });
  }
}

// Initialize the application
const desktopApp = new MultiAgentDesktopApp();
desktopApp.initialize();
