import { contextBridge, clipboard } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Connection, Exchange, Queue, RabbitOptions } from '../common/types'

// Custom APIs for renderer
const api = {
  system: {
    copyToClipboard(text: string) {
      return clipboard.writeText(text)
    }
  },
  connection: {
    async list(): Promise<Connection[]> {
      return await electronAPI.ipcRenderer.invoke('connection-list')
    },
    async save(connection: Connection) {
      return await electronAPI.ipcRenderer.invoke('connection-save', connection)
    },
    async delete(id: string) {
      return await electronAPI.ipcRenderer.invoke('connection-delete', id)
    }
  },
  rabbit: {
    async connect(options: RabbitOptions) {
      const response = await electronAPI.ipcRenderer.invoke('rabbit-connect', options)

      if (response?.error)
        throw new Error(
          `Unable to establish a connection to Rabbit. Reason: ${response.error.reason}`
        )
      return response
    },
    async disconnect() {
      return await electronAPI.ipcRenderer.invoke('rabbit-disconnect')
    },
    async listExchanges() {
      const response = await electronAPI.ipcRenderer.invoke('rabbit-list-exchanges')
      if (response?.error) {
        throw new Error(
          `Unable to list exchanges, verify that your management port is correct. Reason: ${response.error.reason}`
        )
      }

      return response
    },
    async hideExchange(exchange: Exchange) {
      return await electronAPI.ipcRenderer.invoke('rabbit-exchange-hide', exchange)
    },
    async unHideExchange(exchange: Exchange) {
      return await electronAPI.ipcRenderer.invoke('rabbit-exchange-unhide', exchange)
    },
    async addQueue(name: string, exchange: string, bindOptions: any) {
      return await electronAPI.ipcRenderer.invoke('rabbit-add-queue', {
        name,
        exchange,
        bindOptions
      })
    },
    async deleteQueue(queue: Queue) {
      return await electronAPI.ipcRenderer.invoke('rabbit-delete-queue', queue)
    },
    async getMessages(queueId: string | undefined) {
      return await electronAPI.ipcRenderer.invoke('rabbit-get-messages', queueId)
    },
    async publish(message: any) {
      return await electronAPI.ipcRenderer.invoke('rabbit-publish', message)
    },
    onMessage: (callback) =>
      electronAPI.ipcRenderer.on('rabbit-message-received', (_, args) => {
        callback(args)
      }),
    removeMessageListener: () =>
      electronAPI.ipcRenderer.removeAllListeners('rabbit-message-received')
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
