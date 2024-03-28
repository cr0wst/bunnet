<script lang="ts">
  import { connections, selectedConnection } from '../stores/connection'
  import { exchanges, selectedExchange } from '../stores/exchange'
  import { queues } from '../stores/queues'
  import { ulid } from 'ulid'
  import { onMount } from 'svelte'
  import { Trash, Pencil, Icon } from 'svelte-hero-icons'

  const api = window.api

  let connection = {
    id: ulid(),
    name: '',
    url: '',
    port: '',
    managementPort: '',
    vhost: '/',
    username: '',
    password: '',
    useSsl: false
  }

  let error = null

  let isEdit = false

  onMount(async () => {
    const localConnection = {
      id: 'local-connection',
      name: 'Localhost',
      url: 'localhost',
      port: '5672',
      managementPort: '15672',
      vhost: '/',
      username: 'guest',
      password: 'guest'
    }
    await api.connection.save(localConnection)

    await loadConnections()
  })

  async function loadConnections() {
    $connections = Object.values(await api.connection.list())
  }

  async function editConnection(editConnection) {
    isEdit = true
    connection = editConnection
  }

  async function addConnection(connection) {
    await api.connection.save(connection)
    await loadConnections()
    isEdit = false
  }

  async function deleteConnection(connection) {
    await api.connection.delete(connection.id)
    await loadConnections()
  }

  async function connectToRabbit(connection) {
    // Connect to the selected connection
    try {
      const state = await api.rabbit.connect(connection)
      $selectedConnection = connection

      $queues = state.queues

      // Populate the exchanges store
      $exchanges = await api.rabbit.listExchanges()
      if ($exchanges.length === 0) {
        // await api.rabbit.disconnect(connection)
        $selectedConnection = null
      }
      $selectedExchange = $exchanges[0] || null
    } catch (e) {
      error = `Failed to open connection '${connection.name}'. Check your details and try again.`
    }
  }
</script>

<div class="flex w-full h-full">
  <div class="bg-primary-900 w-1/5 flex flex-col">
    <h2 class="text-primary-50 p-2 font-medium text-lg">Connections</h2>
    {#each $connections as connection}
      <button
        class="group bg-primary-700 p-2 border-b text-left border-b-primary-800 text-primary-200 hover:cursor-pointer hover:bg-primary-500 hover:text-primary-50 text-xs font-light transition-all flex justify-between"
        on:click={() => connectToRabbit(connection)}
      >
        <div class="flex items-center justify-between px-2 w-full h-full">
          <div>{connection.name}</div>
          {#if connection.id !== 'local-connection'}
            <div class="flex">
            <button
              class="text-primary-200 text-xs font-extralight group-hover:visible invisible transition-opacity hover:text-primary-50"
              on:click|stopPropagation={() => editConnection(connection)}><Icon src={Pencil} solid class="h-4 w-4" />
            </button>
            <button
              class="text-primary-200 text-xs font-extralight ml-2 group-hover:visible invisible transition-opacity hover:text-primary-50"
              on:click|stopPropagation={() => deleteConnection(connection)}><Icon src={Trash} solid class="h-4 w-4" />
            </button>
            </div>
          {/if}
        </div>
      </button>
    {/each}
  </div>
  <div class="w-3/4 mx-4 text-primary-200">
    <div class="w-full bg-amber-200 border border-yellow-800 text-yellow-800 text-sm rounded-md p-4 m-2 text-center">
      Please be aware that Bunnet is currently in beta stage, so please expect potential bugs and glitches while using the software. Your feedback and patience are greatly appreciated as I work towards enhancing your experience.</div>

    {#if error}
      <div class="w-full bg-red-400 border border-red-800 text-red-800 text-sm rounded-md p-2 m-2">{error}</div>
    {/if}
    <h2 class="text-primary-50 p-2 font-medium text-lg">{isEdit ? 'Edit' : 'Add' } Connection</h2>
    <form class="flex flex-col" on:submit={() => {addConnection(connection)}}>
      <div class="flex">
        <div class="px-4 flex flex-col w-full">
          <label for="routing-key" class="text-primary-300 text-xs pb-1">Name</label>
          <input type="text" class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="My New Connection"
                 bind:value={connection.name}>
        </div>
      </div>

      <div class="flex">
        <div class="px-4 flex flex-col w-1/3">
          <label for="routing-key" class="text-primary-300 text-xs pb-1">Host</label>
          <input type="text" class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="localhost"
                 bind:value={connection.url}>
        </div>
        <div class="px-4 flex flex-col w-1/6">
          <label for="port" class="text-primary-300 text-xs pb-1">Port</label>
          <input type="text" class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="5672"
                 bind:value={connection.port}>
        </div>
        <div class="px-4 flex flex-col w-1/6">
          <label for="port" class="text-primary-300 text-xs pb-1">Management Port</label>
          <input type="text" class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="15672"
                 bind:value={connection.managementPort}>
        </div>
        <div class="px-4 flex flex-col w-1/6">
          <label for="port" class="text-primary-300 text-xs pb-1">Vhost</label>
          <input type="text" class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="/"
                 bind:value={connection.vhost}>
        </div>
        <div class="px-4 flex flex-col w-1/6">
          <label for="port" class="text-primary-300 text-xs pb-1">Use SSL</label>
          <input type="checkbox" class="h-4 w-4 p-2 my-2 accent-primary-800 opacity-20 checked:opacity-100"
                 bind:checked={connection.useSsl}>
        </div>
      </div>

      <div class="flex">
        <div class="px-4 flex flex-col w-1/2">
          <label for="routing-key" class="text-primary-300 text-xs pb-1">Username</label>
          <input type="text" class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="guest"
                 bind:value={connection.username}>
        </div>
        <div class="px-4 flex flex-col w-1/2">
          <label for="port" class="text-primary-300 text-xs pb-1">Password</label>
          <input type="password" class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="**********"
                 bind:value={connection.password}>
        </div>
      </div>

      <div class="flex justify-center">
        <button type="submit" class="bg-primary-500 p-2 rounded-md m-2 w-1/2 hover:bg-primary-300 transition-colors">
          {isEdit ? 'Save' : 'Add' } Connection
        </button>
      </div>
    </form>
     </div>
</div>
