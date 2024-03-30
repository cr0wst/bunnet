<script lang="ts">
  import { exchanges } from '../stores/exchange'
  import { messages } from '../stores/message'
  import ExchangeList from '../components/ExchangeList.svelte'
  import moment from 'moment'
  import JsonBlock from '../components/JsonBlock.svelte'
  import { queues } from '../stores/queues'
  import { onDestroy, onMount } from 'svelte'
  import AddQueueButton from '../components/AddQueueButton.svelte'
  import { Trash, Icon } from 'svelte-hero-icons'
  import { selectedExchange, selectedMessage, selectedQueue } from '../stores/ui'


  const api = window.api

  $: queueMessages = $messages
    .filter((message) => message.queue === $selectedQueue?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // when the selected exchange changes, select the first queue and message if they exist
  $: if ($selectedExchange !== null) {
    $selectedQueue = $queues.find((q) => q.exchange === $selectedExchange.name) || null
  } else {
    $selectedQueue = null
  }

  // when the selected queue changes, select the first message if it exists
  $: if ($selectedQueue !== null) {
    $selectedMessage = queueMessages[0] || null
  } else {
    $selectedMessage = null
  }

  async function deleteQueue(queue) {
    await api.rabbit.deleteQueue(queue)
    $queues = $queues.filter((q) => q !== queue)
  }

  onMount(async () => {
    api.rabbit.onMessage((incoming: any) => {
      const message = {
        exchange: incoming.exchange,
        queue: incoming.queue,
        timestamp: new Date().toISOString(),
        headers: incoming.headers,
        body: incoming.body
      }

      messages.update((value) => {
        return [message, ...value]
      })
    })
  })

  onDestroy(() => {
    api.rabbit.removeMessageListener()
  })

  function unhideExchanges() {
    exchanges.update((value) => {
      return value.map((e) => {
        if (e.hidden) {
          api.rabbit.unHideExchange(e)
        }
        e.hidden = false
        return e
      })
    })
  }

  $: hiddenExchangeCount = $exchanges.filter((e) => e.hidden).length
</script>

<div class="flex h-full w-full">
  <!-- exchange list -->
  <div class="bg-primary-900 w-1/5 flex flex-col">
    <h2 class="text-primary-50 p-2 font-medium text-lg">Exchanges</h2>
    <ExchangeList />
    {#if hiddenExchangeCount > 0}
      <div class="text-primary-200 text-xs font-extralight text-center p-2 italic">{hiddenExchangeCount} Exchanges
        Hidden.
        <button on:click={unhideExchanges} class="text-primary-50 hover:font-bold">Unhide All</button>
      </div>
    {/if}
  </div>

  <!-- message section -->
  <div class="h-full w-4/5 bg-primary-800 flex flex-col">
    {#if $selectedExchange !== null}
      <div class="w-full h-8 bg-primary-600 overflow-x-scroll flex">
        {#each $queues.filter((q) => q.exchange === $selectedExchange.name) as queue}
          <button
            class="w-64 h-full bg-primary-700 hover:bg-primary-500 hover:text-primary-50 hover:font-medium transition-all"
            on:click={() => ($selectedQueue = queue)}
            class:selected-queue={$selectedQueue === queue}
          >
            <div class="flex items-center justify-between px-2 h-full group">
              <div class="text-primary-200 text-xs font-light">{queue.name}</div>
              <button
                on:click={() => deleteQueue(queue)}
                class="text-primary-200 text-xs font-extralight ml-2 group-hover:visible invisible transition-opacity"
              >
                <Icon src={Trash} class="w-4 h-4" solid />
              </button
              >
            </div>
          </button>
        {/each}
        {#if $selectedExchange}
          <AddQueueButton />
        {/if}
      </div>

      <!-- message list -->
      <div class="w-full h-1/3 border-b border-b-primary-900 overflow-y-scroll">
        {#each queueMessages as message}
          <button
            class="fade-right-side flex w-full bg-primary-800 hover:bg-primary-500 hover:text-primary-50 hover:font-medium transition-all items-center"
            on:click={() => ($selectedMessage = message)}
            class:selected={$selectedMessage === message}
          >
            <div
              class="text-primary-100 text-sm font-medium min-w-fit text-left p-1 mr-2"
              title={message.timestamp}
            >
              {moment(message.timestamp).format('MMM DD, yyyy HH:mm:ss')}
            </div>
            <div
              class="text-xs font-light font-mono truncate text-primary-200"
              title={JSON.stringify(message.body)}
            >
              <JsonBlock data={message.body} />
            </div>
          </button>
        {/each}
      </div>
      <!-- message body and headers -->
      <div class="flex overflow-hidden h-2/3">
        <div class="flex flex-col w-1/2 overflow-hidden">
          <div class="w-full p-1 bg-primary-950 text-primary-50 text-xs font-light">
            Message Body
          </div>
          <div
            class="flex w-full h-full overflow-hidden bg-primary-800 p-1 border-r border-r-primary-900"
          >
            {#if $selectedMessage !== null}
              <div
                class="h-full w-full overflow-y-scroll whitespace-pre-wrap font-mono text-primary-100"
              >
                <JsonBlock data={$selectedMessage.body} />
              </div>
            {/if}
          </div>
        </div>
        <div class="flex flex-col h-full w-1/2 overflow-hidden">
          <div class="w-full p-1 bg-primary-950 text-primary-50 text-xs font-light">
            Message Headers
          </div>
          <div
            class="flex w-full h-full overflow-hidden bg-primary-800 p-1 border-r border-r-primary-900 text-primary-100"
          >
            {#if $selectedMessage !== null && $selectedMessage.exchange === $selectedExchange.name}
              <div class="h-full w-full overflow-y-scroll whitespace-pre-wrap font-mono">
                <JsonBlock data={$selectedMessage.headers} />
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .selected {
    @apply bg-primary-500 text-primary-50 font-medium transition-all;
  }

  .selected-queue {
    @apply bg-primary-800 text-primary-50 font-medium transition-all;
  }

  .fade-right-side {
    mask-image: linear-gradient(to right, white 95%, transparent 100%);
  }
</style>
