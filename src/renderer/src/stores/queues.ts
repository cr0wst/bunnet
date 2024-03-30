import type { Queue } from '@common/types'
import { writable } from 'svelte/store'

export const queues = writable<Queue[]>()
