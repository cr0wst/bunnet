<script lang="ts">
  import { connections, selectedConnection } from '../stores/connection'
  import { exchanges, selectedExchange } from '../stores/exchange'
  const api = window.api

  async function connectToRabbit(connection) {
    // Connect to the selected connection
    await api.rabbit.connect(connection)
    $selectedConnection = connection

    // Populate the exchanges store
    $exchanges = await api.rabbit.listExchanges()
    if ($exchanges.length === 0) {
      // await api.rabbit.disconnect(connection)
      $selectedConnection = null
    }
    $selectedExchange = $exchanges[0] || null
  }
</script>

<div class="flex flex-col items-center justify-center w-full">
  {#each $connections as connection}
    <button
      class="bg-primary-100 m-2 w-1/2 rounded-md p-4 text-sm hover:bg-primary-200 transition-colors font-medium"
      on:click={() => connectToRabbit(connection)}
    >
      {connection.name}
    </button>
  {/each}
</div>
