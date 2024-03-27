export type Message = {
  exchange: string
  queue: string
  timestamp: string
  headers: Record<string, any>
  body: Record<string, any>
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
  name: string
}

export type Queue = {
  id: string
  name: string
  exchange: string
}

export type RabbitOptions = {
  connection: Connection
}
