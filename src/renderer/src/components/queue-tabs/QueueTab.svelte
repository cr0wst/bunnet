<script lang="ts">
  import type { Queue } from '@common/types'
  import { selectedQueue, unreadMessageQueues } from '../../stores/ui'
  import { Icon, XMark } from 'svelte-hero-icons'
  import { queues } from '../../stores/queues'
  import { messages } from '../../stores/message'

  const api = window.api

  export let queue: Queue

  async function selectQueue() {
    selectedQueue.set(queue)
    messages.set(await api.rabbit.getMessages(queue.id) || [])
    unreadMessageQueues.update((queues) => {
      return queues.filter((q) => q.queue !== queue.id)
    })
  }

  async function deleteQueue() {
    await api.rabbit.deleteQueue(queue)
    $queues = $queues.filter((q) => q !== queue)
  }
</script>

<button
  class="relative w-64 h-full bg-primary-700 hover:bg-primary-500 font-light hover:text-primary-50 transition-all"
  on:click={() => selectQueue()}
  class:selected={$selectedQueue === queue}
>
  <span class="flex items-center justify-between px-2 h-full group">
    <span class="text-primary-200 text-xs">{queue.name}</span>
    {#if $unreadMessageQueues.some((q) => q.queue === queue.id)}
        <span
          class="block w-2 aspect-square bg-orange-400 rounded-full z-50 absolute right-[10px] group-hover:invisible top-1/2 mt-[-4px]"></span>
      {/if}
    <button
      on:click={() => deleteQueue()}
      class="text-primary-200 text-xs font-extralight ml-2 group-hover:visible invisible transition-opacity"
    >
      <Icon src={XMark} class="w-4 h-4" solid />
    </button
    >
  </span>
</button>

<style lang="postcss">
  .selected {
    @apply bg-primary-800 text-primary-50 font-bold transition-all;
  }
</style>
