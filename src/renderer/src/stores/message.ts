import type { Message } from '@common/types'
import { writable } from 'svelte/store'

export const messages = writable<Message[]>([])

