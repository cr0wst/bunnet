<script lang="ts">
  import { PaperAirplane, Icon } from 'svelte-hero-icons'
  import Modal from '../modal/Modal.svelte'
  import PublishMessageForm from './PublishMessageForm.svelte'

  let open = false
</script>

<button
  class="flex justify-center items-center h-8 aspect-square mr-2 bg-primary-700 rounded-full text-primary-200 hover:bg-primary-500 hover:text-primary-50 hover:font-medium transition-all"
  on:click={() => { open = true}}>
  <Icon src={PaperAirplane} class="h-4 aspect-square" solid />
</button>

<Modal {open} on:close={() => { open = false }} title="Publish Message">
  <div slot="content">
    <PublishMessageForm on:submitted={() => { open = false }} on:cancel={() => { open = false}} />
  </div>
</Modal>


