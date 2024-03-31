<script lang="ts">
  import { createForm } from 'svelte-forms-lib'
  import { selectedExchange, selectedQueue } from '../../stores/ui'
  import { queues } from '../../stores/queues'
  import { createEventDispatcher } from 'svelte'

  const rabbit = window.api.rabbit

  const dispatch = createEventDispatcher()

  const { form, errors, handleSubmit, handleChange } = createForm({
    initialValues: {
      name: '',
      routingKey: '',
      argumentOne: { key: '', value: '' },
      argumentTwo: { key: '', value: '' },
      argumentThree: { key: '', value: '' }
    },
    validate: (values) => {
      const errors: any = {}
      if (!values.name) {
        errors.name = 'Queue name is required.'
      }
      return errors
    },
    onSubmit: async (values) => {
      const bindOptions: any = {
        routingKey: values.routingKey,
        arguments: {}
      }
      if (values.argumentOne.key) {
        bindOptions.arguments[values.argumentOne.key] = values.argumentOne.value
      }
      if (values.argumentTwo.key) {
        bindOptions.arguments[values.argumentTwo.key] = values.argumentTwo.value
      }
      if (values.argumentThree.key) {
        bindOptions.arguments[values.argumentThree.key] = values.argumentThree.value
      }

      const queue = await rabbit.addQueue(values.name, $selectedExchange.name, bindOptions)
      $queues = [...$queues, queue]

      // Select the new queue
      $selectedQueue = queue

      dispatch('submitted')
    }
  })
</script>

<form on:submit={handleSubmit}>
  <div class="flex items-start">
    <div class="w-1/2 flex flex-col items-start">
      <div class="px-4 flex flex-col w-full mb-4">
        <label for="queue-name" class="text-primary-300 text-xs pb-1">Queue Name</label>
        <!-- svelte-ignore a11y-autofocus -->
        <input type="text" class="w-full p-2 bg-primary-800 rounded-md text-sm" placeholder="Queue Name"
               class:error={$errors.name}
               bind:value="{$form.name}"
               on:change={handleChange}
        >
        {#if $errors.name}
          <div class="text-red-500 font-light text-xs p-1">{$errors.name}</div>
        {/if}
      </div>
      <div class="px-4 flex flex-col w-full">
        <label for="routing-key" class="text-primary-300 text-xs pb-1">Routing Key (Optional)</label>
        <input type="text" class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Routing Key"
               bind:value="{$form.routingKey}"
               on:change={handleChange}
        >
      </div>
    </div>
    <div class="w-1/2 flex flex-col items-start">
      <div class="px-4 flex flex-col w-full">
        <label for="arguments" class="text-primary-300 text-xs pb-1">Arguments (Optional)</label>
        <div class="flex justify-between">
          <input type="text" class="w-1/2 mr-1 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Key"
                 bind:value="{$form.argumentOne.key}"
                 on:change={handleChange}
          >
          <input type="text" class="w-1/2 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Value"
                 bind:value="{$form.argumentOne.value}"
                 on:change={handleChange}
          >
        </div>
        <div class="flex justify-between">
          <input type="text" class="w-1/2 mr-1 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Key"
                 bind:value="{$form.argumentTwo.key}"
                 on:change={handleChange}
          >
          <input type="text" class="w-1/2 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Value"
                 bind:value="{$form.argumentTwo.value}"
                 on:change={handleChange}
          >
        </div>
        <div class="flex justify-between">
          <input type="text" class="w-1/2 mr-1 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Key"
                 bind:value="{$form.argumentThree.key}"
                 on:change={handleChange}
          >
          <input type="text" class="w-1/2 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Value"
                 bind:value="{$form.argumentThree.value}"
                 on:change={handleChange}
          >
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-row-reverse">
    <button type="submit" class="bg-primary-900 p-2 rounded-md m-2 w-24 hover:bg-primary-500 transition-colors">
      Save
    </button>
  </div>
</form>

<style lang="postcss">
  .error {
    @apply ring-1 ring-red-500;
  }
</style>
