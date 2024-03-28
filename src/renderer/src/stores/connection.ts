import { writable } from 'svelte/store'
import type { Connection } from '@common/types'

export const connections = writable<Connection[]>([
  {
    id: "localhost-id",
    name: 'Default Localhost Connection',
    url: 'localhost',
    useSsl: false,
    port: 5672,
    managementPort: 15672,
    username: 'guest',
    password: 'guest',
    vhost: '/'
  }
])

export const selectedConnection = writable<Connection | null>(null)
