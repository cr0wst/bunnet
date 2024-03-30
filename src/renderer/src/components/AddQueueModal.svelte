{#if open}
  <div class="modal z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0">
    <div class="modal-overlay fixed w-full h-full bg-gray-900 opacity-50"></div>
    <div class="z-50 bg-primary-700 text-primary-200 w-1/2 rounded-md">
      <div class="flex justify-between items-center p-4 font-light text-primary-300 text-sm">
        Add New Queue
      </div>
      <form on:submit|preventDefault={save}>
        <div class="flex items-start">
          <div class="w-1/2 flex flex-col items-start">
            <div class="px-4 flex flex-col w-full">
              <label for="queue-name" class="text-primary-300 text-xs pb-1">Queue Name</label>
              <!-- svelte-ignore a11y-autofocus -->
              <input type="text" class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Queue Name"
                     bind:value="{name}" autofocus>
            </div>
            <div class="px-4 flex flex-col w-full">
              <label for="routing-key" class="text-primary-300 text-xs pb-1">Routing Key</label>
              <input type="text" class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Routing Key"
                     bind:value="{routingKey}">
            </div>
          </div>
          <div class="w-1/2 flex flex-col items-start">
            <div class="px-4 flex flex-col w-full">
              <label for="arguments" class="text-primary-300 text-xs pb-1">Arguments</label>
              <div class="flex justify-between">
                <input type="text" class="w-1/2 mr-1 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Key"
                       bind:value="{argumentOne.key}">
                <input type="text" class="w-1/2 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Value"
                       bind:value="{argumentOne.value}">
              </div>
              <div class="flex justify-between">
                <input type="text" class="w-1/2 mr-1 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Key"
                       bind:value="{argumentTwo.key}">
                <input type="text" class="w-1/2 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Value"
                       bind:value="{argumentTwo.value}">
              </div>
              <div class="flex justify-between">
                <input type="text" class="w-1/2 mr-1 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Key"
                       bind:value="{argumentThree.key}">
                <input type="text" class="w-1/2 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Value"
                       bind:value="{argumentThree.value}">
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-between">
          <button type="reset"
                  class="border border-primary-900 p-2 rounded-md m-2 w-24 hover:bg-primary-500 hover:border-primary-200 transition-colors"
                  on:click={cancel}>Cancel
          </button>
          <button type="submit" class="bg-primary-900 p-2 rounded-md m-2 w-24 hover:bg-primary-500 transition-colors">
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
<script>
  import { queues } from '../stores/queues'
  import { selectedExchange, selectedQueue } from '../stores/ui'
  import { createEventDispatcher } from 'svelte'

  const api = window.api

  export let open = false

  const dispatch = createEventDispatcher()

  let name = ''
  let routingKey = null
  let argumentOne = {
    key: '',
    value: ''
  }
  let argumentTwo = {
    key: '',
    value: ''
  }
  let argumentThree = {
    key: '',
    value: ''
  }

  function cancel() {
    name = ''
    routingKey = null
    argumentOne = {
      key: '',
      value: ''
    }
    argumentTwo = {
      key: '',
      value: ''
    }
    argumentThree = {
      key: '',
      value: ''
    }
    dispatch('close')
  }

  async function save() {
    if (name) {
      const bindOptions = {
        routingKey,
        arguments: {}
      }
      if (argumentOne.key && argumentOne.value) {
        bindOptions.arguments[argumentOne.key] = argumentOne.value
      }
      if (argumentTwo.key && argumentTwo.value) {
        bindOptions.arguments[argumentTwo.key] = argumentTwo.value
      }
      if (argumentThree.key && argumentThree.value) {
        bindOptions.arguments[argumentThree.key] = argumentThree.value
      }
      const queue = await api.rabbit.addQueue(name, $selectedExchange.name, bindOptions)
      $queues = [...$queues, queue]

      // Select the new queue
      $selectedQueue = queue
    }
    cancel()
  }
</script>
