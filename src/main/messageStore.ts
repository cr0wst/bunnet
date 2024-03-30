import { Message } from '../common/types'
import { ipcMain, webContents } from 'electron'

export class MessageStore {
  private messages: Message[] = []

  constructor() {
    ipcMain.handle('rabbit-get-messages', (_, queueId) => {
      return this.getAll(queueId)
    })
  }

  public push(message: Message) {
    // Add message to the store
    this.messages.push(message)

    // Notify the renderer process
    webContents.getAllWebContents().forEach((wc) => {
      wc.send('rabbit-message-received', message)
    })
  }

  public getAll(queueId: string | undefined) {
    if (!queueId) {
      return this.messages
    }
    return this.messages.filter((message) => message.queueId === queueId)
  }
}
