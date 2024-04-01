<script lang="ts">
  import { Plus, Icon } from 'svelte-hero-icons'
  import Modal from '../modal/Modal.svelte'
  import AddQueueForm from './AddQueueForm.svelte'

  let open = false
</script>

<button
  class="flex justify-center items-center min-w-8 w-8 h-full bg-primary-700 text-primary-200 hover:bg-primary-500 hover:text-primary-50 hover:font-medium transition-all ml-auto"
  on:click={() => { open = true}}>
  <Icon src={Plus} class="w-4 h-4" />
</button>

<Modal {open} on:close={() => {open = false}} title="Add Queue">
  <div slot="content">
    <AddQueueForm on:submitted={() => {open = false}} />
  </div>
</Modal>
