<script lang="ts">
  import Connections from './routes/Connections.svelte'
  import QueueView from './routes/QueueView.svelte'
  import { selectedConnection } from './stores/connection'

  import Logo from './assets/logo.svelte'
</script>

<div class="flex flex-col min-h-screen">
  <!-- header -->
  <div class="sticky z-50 top-0 p-2 bg-primary-950 h-12">
    <div class="flex justify-between items-center h-full">
      <button class="flex items-center" on:click={() => ($selectedConnection = null)}>
        <div class="rounded-full p-1 mr-2 bg-primary-50 flex items-center justify-around">
          <Logo />
        </div>
        <span class="text-2xl text-primary-50 font-logo">Bunnet</span>
      </button>
    </div>
  </div>

  <!-- main -->
  <div class="h-[calc(100vh-72px)]">
    {#if $selectedConnection === null}
      <Connections />
    {:else}
      <QueueView />
    {/if}
  </div>

  <!-- footer -->
  <div class="sticky z-50 bg-primary-950 bottom-0 p-1 mx-2 h-6">
    <div class="flex items-center justify-between">
      {#if $selectedConnection !== null}
        <div class="flex items-center">
          <div class="w-2 h-2 mr-1 bg-green-600 rounded-full"></div>
          <div class="text-xs font-light text-primary-100">Connected</div>
        </div>
        <div class="text-xs text-primary-200 font-bold ml-4">
          {$selectedConnection.name}
          (<span class="text-primary-300"
            >{$selectedConnection.useSsl
              ? 'amqps'
              : 'amqp'}://{$selectedConnection.username}:********@{$selectedConnection.url}:{$selectedConnection.port}{$selectedConnection.vhost}</span
          >)
        </div>
      {:else}
        <div class="flex items-center">
          <div class="w-2 h-2 mr-1 bg-red-600 rounded-full"></div>
          <div class="text-xs font-light text-primary-100">Disconnected</div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style type="postcss">
  :global(body) {
    @apply h-full w-full bg-primary-950;
  }
</style>
