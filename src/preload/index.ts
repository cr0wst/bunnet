import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Queue, RabbitOptions } from '../common/types'

// Custom APIs for renderer
const api = {
  rabbit: {
    async connect(options: RabbitOptions) {
      return await electronAPI.ipcRenderer.invoke('rabbit-connect', options)
    },
    async listExchanges() {
      return await electronAPI.ipcRenderer.invoke('rabbit-list-exchanges')
    },
    async addQueue(name: string, exchange: string) {
      return await electronAPI.ipcRenderer.invoke('rabbit-add-queue', { name, exchange })
    },
    async deleteQueue(queue: Queue) {
      return await electronAPI.ipcRenderer.invoke('rabbit-delete-queue', queue)
    },
    onMessage: (callback) =>
      electronAPI.ipcRenderer.on('rabbit-message-received', (_, args) => {
        console.log('Received message', args)
        callback(args)
      })
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
