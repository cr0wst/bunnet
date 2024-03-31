<script>
import { queues } from '../../stores/queues'
import { selectedExchange } from '../../stores/ui'
import AddQueueButton from './AddQueueButton.svelte'
import QueueTab from './QueueTab.svelte'
</script>


<div class="w-full h-8 bg-primary-600 overflow-x-scroll flex">
  {#each $queues.filter((q) => q.exchange === $selectedExchange.name) as queue}
    <QueueTab {queue}/>
  {/each}
  {#if $selectedExchange}
    <AddQueueButton />
  {/if}
</div>
