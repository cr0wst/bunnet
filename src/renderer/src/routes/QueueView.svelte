<script lang="ts">
  import { messages } from '../stores/message'
  import ExchangeList from '../components/ExchangeList.svelte'
  import moment from 'moment'
  import JsonBlock from '../components/JsonBlock.svelte'
  import { queues } from '../stores/queues'
  import { onDestroy, onMount } from 'svelte'
  import AddQueueButton from '../components/AddQueueButton.svelte'
  import { Trash, Icon, BarsArrowUp, BarsArrowDown } from 'svelte-hero-icons'
  import { selectedExchange, selectedMessage, selectedQueue } from '../stores/ui'
  import type { Message, Queue } from '@common/types'


  const api = window.api

  // when the selected queue changes, load the messages
  $: if ($selectedQueue) {
    api.rabbit.getMessages($selectedQueue.id).then(m => {
      messages.set(m || [])
      selectedMessage.set(m[0] || null)
    })
  } else {
    messages.set([])
    selectedMessage.set(null)
  }

  async function deleteQueue(queue) {
    await api.rabbit.deleteQueue(queue)
    $queues = $queues.filter((q) => q !== queue)
  }

  onMount(async () => {
    api.rabbit.onMessage((incoming: Message) => {
      // Only add the message if it belongs to the selected queue
      if (incoming.queueId == $selectedQueue.id) {
        messages.update((value) => {
          return [incoming, ...value]
        })
      }
    })

    if ($selectedExchange) {
      $selectedQueue = $queues.find((q) => q.exchange === $selectedExchange.name)
    }
  })

  onDestroy(() => {
    api.rabbit.removeMessageListener()
  })

  async function selectQueue(queue: Queue) {
    $selectedQueue = queue
    // load messages from main
    messages.set(await api.rabbit.getMessages(queue.id) || [])
  }

  let sortDirection = 'asc'
  function toggleMessageSort() {
    sortDirection = sortDirection === 'desc' ? 'asc' : 'desc'
  }

  $: sortedMessages = $messages.sort((a, b) => {
    if (sortDirection === 'asc') {
      return a.timestamp.valueOf() - b.timestamp.valueOf()
    }
    return b.timestamp.valueOf() - a.timestamp.valueOf()
  })
</script>

<div class="flex h-full w-full">
  <!-- exchange list -->
  <ExchangeList />
  <!-- message section -->
  <div class="h-full w-4/5 bg-primary-800 flex flex-col">
    {#if $selectedExchange !== null}
      <div class="w-full h-8 bg-primary-600 overflow-x-scroll flex">
        {#each $queues.filter((q) => q.exchange === $selectedExchange.name) as queue}
          <button
            class="w-64 h-full bg-primary-700 hover:bg-primary-500 hover:text-primary-50 hover:font-medium transition-all"
            on:click={() => selectQueue(queue)}
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
      <div class="w-full flex bg-primary-950 text-primary-50 text-xs font-light items-center">
        <button class="text-left p-1 mr-2 w-1/6 flex justify-between"
        on:click={toggleMessageSort}
        >Timestamp <Icon src="{sortDirection === 'desc' ? BarsArrowUp : BarsArrowDown}" class="w-4 h-4" /></button>
        <div>Message</div>
      </div>
      <div class="w-full h-1/3 border-b border-b-primary-900 overflow-y-scroll">
        {#each sortedMessages as message}
          <button
            class="fade-right-side flex w-full bg-primary-800 hover:bg-primary-500 hover:text-primary-50 hover:font-medium transition-all items-center"
            on:click={() => ($selectedMessage = message)}
            class:selected={$selectedMessage === message}
          >
            <div
              class="text-primary-100 text-sm font-medium w-1/6 text-left p-1 mr-2"
              title={message.timestamp.toISOString()}
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
            {#if $selectedMessage !== null && $selectedMessage.headers}
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
