<script>
  import { exchanges, selectedExchange } from '../stores/exchange'
</script>

{#each $exchanges as exchange}
  <button
    class="bg-primary-700 p-2 border-b text-left border-b-primary-800 text-primary-200 hover:cursor-pointer hover:bg-primary-300 hover:text-primary-50 text-xs font-light transition-all"
    on:click={() => ($selectedExchange = exchange)}
    class:selected={$selectedExchange === exchange}
  >
    {exchange.name}
  </button>
{/each}

<style lang="postcss">
  .selected {
    @apply bg-primary-500 text-primary-50 font-medium transition-all;
  }
</style>
