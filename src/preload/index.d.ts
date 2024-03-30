import { ElectronAPI } from '@electron-toolkit/preload'
import { Queue } from '../common/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      connection: {
        list(): Promise<Connection[]>
        save(connection: Connection): Promise<void>
        delete(id: string): Promise<void>
      },
      rabbit: {
        connect(options: RabbitOptions): Promise<{ queues: Queue[] }>
        disconnect(): Promise<void>
        listExchanges(): Promise<Exchange[]>
        hideExchange(exchange: Exchange): Promise<void>
        unHideExchange(exchange: Exchange): Promise<void>
        addQueue(name: string, exchange: string, bindOptions: any): Promise<Queue>
        deleteQueue(queue: Queue): Promise<void>
        onMessage(callback: (message: Message) => void): void
        removeMessageListener(): void
      }
    }
  }
}
