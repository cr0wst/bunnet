<script lang="ts">
  import { connections, selectedConnection } from '../stores/connection'
  import { exchanges } from '../stores/exchange'
  import { queues } from '../stores/queues'
  import { ulid } from 'ulid'
  import { onMount } from 'svelte'
  import { Trash, Pencil, Icon, ArrowPath } from 'svelte-hero-icons'
  import { selectedExchange, selectedQueue } from '../stores/ui'
  import { createForm } from 'svelte-forms-lib'

  const api = window.api

  let error = null

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
    $form = editConnection
  }

  async function addConnection(connection) {
    await handleConnect(connection)
    await api.connection.save(connection)
  }

  async function deleteConnection(connection) {
    await api.connection.delete(connection.id)
    await loadConnections()
  }

  async function connectToRabbit(connection) {
    // Connect to the selected connection
    const state = await api.rabbit.connect(connection)
    // Populate the exchanges store
    $exchanges = await api.rabbit.listExchanges()

    $selectedConnection = connection

    $queues = state.queues
    if ($exchanges.length === 0) {
      // await api.rabbit.disconnect(connection)
      $selectedConnection = null
    }
    $selectedExchange = $exchanges.find((e) => !e.hidden) || null
    $selectedQueue = $queues.find((q) => q.exchange === $selectedExchange.name) || null
  }

  let connecting = false
  let connectingToConnection = null

  async function handleConnect(connection) {
    connecting = true
    connectingToConnection = connection
    try {
      await connectToRabbit(connection)
    } catch (e) {
      error = `${e.message}`
      await editConnection(connection)
    }
    connecting = false
  }

  async function handleCancel() {
    try {
      await api.rabbit.disconnect()
    } catch (e) {}
    connecting = false
  }

  const { form, errors, handleSubmit, handleChange, handleReset } = createForm({
    initialValues: {
      id: ulid(),
      name: '',
      url: '',
      port: '',
      managementPort: '',
      vhost: '/',
      username: '',
      password: '',
      useSsl: false
    },
    validate: (values) => {
      const errors: any = {}
      if (!values.name) {
        errors.name = 'Name is required'
      }
      if (!values.url) {
        errors.url = 'Host is required'
      }
      if (!values.port) {
        errors.port = 'Port is required'
      }
      if (!values.managementPort) {
        errors.managementPort = 'Management Port is required'
      }
      if (!values.vhost) {
        errors.vhost = 'Vhost is required'
      }
      if (!values.username) {
        errors.username = 'Username is required'
      }
      if (!values.password) {
        errors.password = 'Password is required'
      }
      return errors
    },
    onSubmit: async (values) => {
      await addConnection(values)
    }
  })
</script>

<div class="flex w-full h-full">
  {#if connecting}
    <div class="w-full h-full flex items-center justify-center">
      <div class="flex flex-col items-center py-4 px-8 rounded-md bg-primary-800">
        <div class="text-primary-50 p-2 font-semibold text-lg">
          Connecting to {connectingToConnection.name}
        </div>
        <Icon src={ArrowPath} class="w-8 aspect-square animate-spin stroke-primary-50" />
        <div class="text-primary-200 text-sm my-2">
          Please wait while we attempt to establish a connection.
        </div>
        <button
          class="bg-primary-500 p-2 rounded-md m-2 w-1/2 hover:bg-primary-300 transition-colors text-primary-200"
          on:click={() => handleCancel()}>Cancel</button
        >
      </div>
    </div>
  {:else}
    <div class="bg-primary-900 w-1/5 flex flex-col">
      <h2 class="text-primary-50 p-2 font-medium text-lg">Connections</h2>
      {#each $connections as connection}
        <button
          class="group bg-primary-700 p-2 border-b text-left border-b-primary-800 text-primary-200 hover:cursor-pointer hover:bg-primary-500 hover:text-primary-50 text-xs font-light transition-all flex justify-between"
          on:click={() => handleConnect(connection)}
        >
          <span class="flex items-center justify-between px-2 w-full h-full">
            <span>{connection.name}</span>
            {#if connection.id !== 'local-connection'}
              <div class="flex">
                <button
                  class="text-primary-200 text-xs font-extralight group-hover:visible invisible transition-opacity hover:text-primary-50"
                  on:click|stopPropagation={() => editConnection(connection)}
                  ><Icon src={Pencil} solid class="h-4 w-4" />
                </button>
                <button
                  class="text-primary-200 text-xs font-extralight ml-2 group-hover:visible invisible transition-opacity hover:text-primary-50"
                  on:click|stopPropagation={() => deleteConnection(connection)}
                  ><Icon src={Trash} solid class="h-4 w-4" />
                </button>
              </div>
            {/if}
          </span>
        </button>
      {/each}
    </div>
    <div class="w-3/4 mx-4 text-primary-200">
      {#if error}
        <div
          class="w-full bg-red-400 border border-red-800 text-red-800 text-sm rounded-md p-2 m-2"
        >
          {error}
        </div>
      {/if}
      <h2 class="text-primary-50 p-2 font-medium text-lg">Connection Details</h2>
      <form class="flex flex-col" on:submit={handleSubmit}>
        <div class="flex">
          <div class="px-4 flex flex-col w-full">
            <div class="mb-4">
              <label for="routing-key" class="text-primary-300 text-xs pb-1">Name</label>
              <input
                type="text"
                class="w-full p-2 bg-primary-800 rounded-md text-sm"
                placeholder="Enter a Connection Name."
                bind:value={$form.name}
                class:error={$errors.name}
                on:change={handleChange}
              />
              {#if $errors.name}
                <div class="text-red-500 font-light text-xs p-1">{$errors.name}</div>
              {/if}
            </div>
          </div>
        </div>

        <div class="flex">
          <div class="px-4 flex flex-col w-1/3 mb-4">
            <label for="routing-key" class="text-primary-300 text-xs pb-1">Host</label>
            <input
              type="text"
              class="w-full p-2 bg-primary-800 rounded-md text-sm"
              placeholder="Enter a host."
              bind:value={$form.url}
              class:error={$errors.url}
              on:change={handleChange}
            />
            {#if $errors.url}
              <div class="text-red-500 font-light text-xs p-1">{$errors.url}</div>
            {/if}
          </div>
          <div class="px-4 flex flex-col w-1/6">
            <label for="port" class="text-primary-300 text-xs pb-1">Port</label>
            <input
              type="text"
              class="w-full p-2 bg-primary-800 rounded-md text-sm"
              placeholder="Enter a port."
              bind:value={$form.port}
              class:error={$errors.port}
              on:change={handleChange}
            />
            {#if $errors.port}
              <div class="text-red-500 font-light text-xs p-1">{$errors.port}</div>
            {/if}
          </div>
          <div class="px-4 flex flex-col w-1/6">
            <label for="port" class="text-primary-300 text-xs pb-1">Management Port</label>
            <input
              type="text"
              class="w-full p-2 bg-primary-800 rounded-md text-sm"
              placeholder="Enter a management port."
              bind:value={$form.managementPort}
              class:error={$errors.managementPort}
              on:change={handleChange}
            />
            {#if $errors.managementPort}
              <div class="text-red-500 font-light text-xs p-1">{$errors.managementPort}</div>
            {/if}
          </div>
          <div class="px-4 flex flex-col w-1/6">
            <label for="port" class="text-primary-300 text-xs pb-1">Vhost</label>
            <input
              type="text"
              class="w-full p-2 bg-primary-800 rounded-md text-sm"
              placeholder="Enter a vhost"
              bind:value={$form.vhost}
              class:error={$errors.vhost}
              on:change={handleChange}
            />
            {#if $errors.vhost}
              <div class="text-red-500 font-light text-xs p-1">{$errors.vhost}</div>
            {/if}
          </div>
          <div class="px-4 flex flex-col w-1/6">
            <label for="port" class="text-primary-300 text-xs pb-1">Use SSL</label>
            <input
              type="checkbox"
              class="h-4 w-4 p-2 my-2 accent-primary-800 opacity-20 checked:opacity-100"
              bind:checked={$form.useSsl}
            />
          </div>
        </div>

        <div class="flex">
          <div class="px-4 mb-4 flex flex-col w-1/2">
            <label for="routing-key" class="text-primary-300 text-xs pb-1">Username</label>
            <input
              type="text"
              class="w-full p-2 bg-primary-800 rounded-md text-sm"
              placeholder="Enter a username"
              bind:value={$form.username}
              class:error={$errors.username}
              on:change={handleChange}
            />
            {#if $errors.username}
              <div class="text-red-500 font-light text-xs p-1">{$errors.username}</div>
            {/if}
          </div>
          <div class="px-4 flex flex-col w-1/2">
            <label for="port" class="text-primary-300 text-xs pb-1">Password</label>
            <input
              type="password"
              class="w-full p-2 bg-primary-800 rounded-md text-sm"
              placeholder="Enter a password."
              bind:value={$form.password}
              class:error={$errors.password}
              on:change={handleChange}
            />
            {#if $errors.password}
              <div class="text-red-500 font-light text-xs p-1">{$errors.password}</div>
            {/if}
          </div>
        </div>

        <div class="flex justify-center">
          <button
            type="submit"
            class="bg-primary-500 p-2 rounded-md m-2 w-1/2 hover:bg-primary-300 transition-colors"
          >
            Save and Connect
          </button>
          <button
            type="reset"
            class="bg-primary-500 p-2 rounded-md m-2 w-1/2 hover:bg-primary-300 transition-colors"
            on:click={handleReset}
          >
            Reset Form
          </button>
        </div>
      </form>
      <div
        class="w-2/3 mx-auto bg-amber-200 border border-yellow-800 text-yellow-800 text-sm rounded-md p-4 m-2 text-center"
      >
        Please be aware that Bunnet is currently in beta stage, so please expect potential bugs and
        glitches while using the software. Your feedback and patience are greatly appreciated as I
        work towards enhancing your experience.
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  .error {
    @apply ring-1 ring-red-500;
  }
</style>
