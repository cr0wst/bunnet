<script lang="ts">
  import { PaperAirplane, Icon } from 'svelte-hero-icons'
  import PublishMessageModal from './PublishMessageModal.svelte'

  let addModalOpen = false
</script>

<button
  class="flex justify-center items-center h-8 aspect-square mr-2 bg-primary-700 rounded-full text-primary-200 hover:bg-primary-500 hover:text-primary-50 hover:font-medium transition-all"
  on:click={() => { addModalOpen = true}}>
  <Icon src={PaperAirplane} class="h-4 aspect-square" solid />
</button>

<PublishMessageModal open={addModalOpen} on:close={() => {addModalOpen = false}} />
