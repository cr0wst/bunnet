import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      rabbit: {
        connect(options: RabbitOptions): Promise<void>
        listExchanges(): Promise<Exchange[]>
        addQueue(name: string, exchange: string): Promise<Queue>
        deleteQueue(queue: Queue): Promise<void>
        onMessage(callback: (message: Message) => void): void
      }
    }
  }
}
