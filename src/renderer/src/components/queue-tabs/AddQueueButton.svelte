<script lang="ts">
  import AddQueueModal from './AddQueueModal.svelte'
  import { Plus, Icon } from 'svelte-hero-icons'

  let addModalOpen = false
</script>

<button
  class="flex justify-center items-center min-w-8 w-8 h-full bg-primary-700 text-primary-200 hover:bg-primary-500 hover:text-primary-50 hover:font-medium transition-all ml-auto"
  on:click={() => { addModalOpen = true}}>
  <Icon src={Plus} class="w-4 h-4"/>
</button>

<AddQueueModal open={addModalOpen} on:close={() => {addModalOpen = false}} />
