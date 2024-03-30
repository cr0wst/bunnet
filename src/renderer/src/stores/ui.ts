import { writable } from 'svelte/store'
import type { Exchange, Message, Queue } from '@common/types'

export const selectedExchange = writable<Exchange | null>(null)

export const selectedQueue = writable<Queue | null>(null)

export const selectedMessage = writable<Message | null>(null)

export function loadUiState(state: UiState) {
  selectedExchange.set(state.selectedExchange)
  selectedQueue.set(state.selectedQueue)
  selectedMessage.set(state.selectedMessage)
}

type UiState = {
  selectedExchange: Exchange | null
  selectedQueue: Queue | null
  selectedMessage: Message | null
}

