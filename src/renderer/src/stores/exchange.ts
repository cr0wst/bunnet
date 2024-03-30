import type { Exchange } from '@common/types'
import { writable } from 'svelte/store'

export const exchanges = writable<Exchange[]>([])

