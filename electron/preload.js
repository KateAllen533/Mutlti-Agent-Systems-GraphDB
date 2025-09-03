import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (defaultPath) => ipcRenderer.invoke('save-file-dialog', defaultPath),
  uploadFile: (filePath) => ipcRenderer.invoke('upload-file', filePath),

  // API communication
  apiRequest: (request) => ipcRenderer.invoke('api-request', request),

  // Menu events
  onMenuNewProject: (callback) => ipcRenderer.on('menu-new-project', callback),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
  onMenuExport: (callback) => ipcRenderer.on('menu-export', callback),
  onNavigateTo: (callback) => ipcRenderer.on('navigate-to', callback),
  onAgentsStartAll: (callback) => ipcRenderer.on('agents-start-all', callback),
  onAgentsStopAll: (callback) => ipcRenderer.on('agents-stop-all', callback),
  onAgentStatus: (callback) => ipcRenderer.on('agent-status', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
