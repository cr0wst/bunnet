export type Message = {
  queueId: string
  timestamp: Date
  headers: Record<string, any> | undefined
  body: any
}

export type Connection = {
  id: string
  name: string
  url: string
  managementPort: number
  port: number
  username: string
  password: string
  vhost: string
  useSsl: boolean
}

export type Exchange = {
  connectionId: string
  name: string
  hidden: boolean
}

export type Queue = {
  id: string
  name: string
  exchange: string
  bindOptions: any
}

export type RabbitOptions = {
  connection: Connection
}
