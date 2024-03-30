<script lang="ts">
  import { exchanges } from '../stores/exchange'
  import type { Exchange } from '@common/types'
  import { EyeSlash, Icon } from 'svelte-hero-icons'
  import { selectedExchange } from '../stores/ui'

  const api = window.api

  function hideExchange(exchange: Exchange) {
    // Set the store state for immediate result
    exchange.hidden = true
    // Update the rabbit state so it persists
    api.rabbit.hideExchange(exchange)

    // Update the exchange store to trigger reactivity
    $exchanges = $exchanges
  }
</script>

{#each $exchanges.filter((e) => !e.hidden) as exchange}
  <button
    class="group bg-primary-700 p-2 border-b text-left border-b-primary-800 text-primary-200 hover:cursor-pointer hover:bg-primary-300 hover:text-primary-50 text-xs font-light transition-all flex justify-between"
    on:click={() => ($selectedExchange = exchange)}
    class:selected={$selectedExchange === exchange}
  >
    {exchange.name}
    <button on:click={() => hideExchange(exchange)}>
      <Icon src="{EyeSlash}" class="w-4 h-4 invisible group-hover:visible" />
    </button>
  </button>
{/each}

<style lang="postcss">
  .selected {
    @apply bg-primary-500 text-primary-50 font-medium transition-all;
  }
</style>
