<script lang="ts">
  import { exchanges } from '../stores/exchange'
  import type { Exchange } from '@common/types'
  import { EyeSlash, Icon } from 'svelte-hero-icons'
  import { selectedExchange, selectedQueue } from '../stores/ui'
  import { queues } from '../stores/queues'
  import PublishMessageButton from './PublishMessageButton.svelte'

  const api = window.api

  async function hideExchange(exchange: Exchange) {
    // Set the store state for immediate result
    exchange.hidden = true
    // Update the rabbit state so it persists
    await api.rabbit.hideExchange(exchange)

    // Update the exchange store to trigger reactivity
    $exchanges = $exchanges

    // If the exchange we just hid was selected, select the first one again
    const nextExchange = $exchanges.find((e) => e.hidden === false)
    if (nextExchange) {
      await selectExchange($exchanges.find((e) => e.hidden === false))
    }
  }


  async function unHideExchanges() {
    $exchanges.filter((e) => e.hidden).forEach((e) => {
      api.rabbit.unHideExchange(e)
      e.hidden = false
    })

    $exchanges = $exchanges
  }

  async function selectExchange(exchange: Exchange) {
    $selectedExchange = exchange
    $selectedQueue = $queues.find((q) => q.exchange === exchange.name)
  }

  $: hiddenExchangeCount = $exchanges.filter((e) => e.hidden).length
</script>

<div class="bg-primary-900 w-1/5 flex flex-col">
  <div class="flex justify-between items-center">
    <h2 class="text-primary-50 p-2 font-medium text-lg">Exchanges</h2>
    <PublishMessageButton/>
  </div>
  {#each $exchanges.filter((e) => !e.hidden) as exchange}
    <button
      class="group bg-primary-700 p-2 border-b text-left border-b-primary-800 text-primary-200 hover:cursor-pointer hover:bg-primary-300 hover:text-primary-50 text-xs font-light transition-all flex justify-between"
      on:click={() => selectExchange(exchange)}
      class:selected={$selectedExchange === exchange}
    >
      {exchange.name}
      <button on:click={() => hideExchange(exchange)}>
        <Icon src="{EyeSlash}" class="w-4 h-4 invisible group-hover:visible" />
      </button>
    </button>
  {/each}
  {#if hiddenExchangeCount > 0}
    <div class="text-primary-200 text-xs font-extralight text-center p-2 italic">{hiddenExchangeCount} Exchanges
      Hidden.
      <button on:click={unHideExchanges} class="text-primary-50 hover:font-bold">Unhide All</button>
    </div>
  {/if}
</div>

<style lang="postcss">
  .selected {
    @apply bg-primary-500 text-primary-50 font-medium transition-all;
  }
</style>
