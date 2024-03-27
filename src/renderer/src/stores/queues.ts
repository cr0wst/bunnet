import type { Queue } from '@common/types'
import { writable } from 'svelte/store'
import { ulid } from 'ulid'

export const queues = writable<Queue[]>([
  {
    id: ulid(),
    name: 'emails',
    exchange: 'amqp.direct'
  },
  {
    id: ulid(),
    name: 'other stuff',
    exchange: 'amqp.direct'
  }
])

export const selectedQueue = writable<Queue | null>(null)
