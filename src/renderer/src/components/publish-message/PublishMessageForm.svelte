<script lang="ts">
  import { createForm } from 'svelte-forms-lib'
  import { selectedExchange } from '../../stores/ui'

  import { createEventDispatcher } from 'svelte'
  import { exchanges } from '../../stores/exchange'

  const rabbit = window.api.rabbit

  const dispatch = createEventDispatcher()

  const { form, handleSubmit } = createForm({
    initialValues: {
      exchange: $selectedExchange.name,
      routingKey: '',
      body: '',
      headerOne: { key: '', value: '' },
      headerTwo: { key: '', value: '' },
      headerThree: { key: '', value: '' }
    },
    onSubmit: async (values) => {
      const headers: any = {}
      if (values.headerOne.key) {
        headers[values.headerOne.key] = values.headerOne.value
      }
      if (values.headerTwo.key) {
        headers[values.headerTwo.key] = values.headerTwo.value
      }
      if (values.headerThree.key) {
        headers[values.headerThree.key] = values.headerThree.value
      }

      const message = {
        exchange: values.exchange,
        routingKey: values.routingKey,
        body: values.body,
        headers: headers
      }

     await rabbit.publish(message)

      dispatch('submitted')
    }
  })
</script>

<form on:submit={handleSubmit}>
  <div class="flex items-start">
    <div class="w-1/2 flex flex-col items-start">
      <div class="px-4 flex flex-col w-full">
        <label for="exchange" class="text-primary-300 text-xs pb-1">Exchange</label>
        <select class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Select an Exchange"
                bind:value="{$form.exchange}">
          {#each $exchanges as exchange}
            <option value={exchange.name}>{exchange.name}</option>
          {/each}
        </select>
        <label for="body" class="text-primary-300 text-xs pb-1">Message</label>
        <textarea class="w-full h-64 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Message"
                  bind:value="{$form.body}"></textarea>
      </div>
    </div>
    <div class="w-1/2 flex flex-col items-start">
      <div class="px-4 flex flex-col w-full">
        <label for="routing-key" class="text-primary-300 text-xs pb-1">Routing Key (Optional)</label>
        <input type="text" class="w-full p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Routing Key"
               bind:value="{$form.routingKey}">
      </div>
      <div class="px-4 flex flex-col w-full">
        <label for="arguments" class="text-primary-300 text-xs pb-1">Headers (Optional)</label>
        <div class="flex justify-between">
          <input type="text" class="w-1/2 mr-1 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Key"
                 bind:value="{$form.headerOne.key}">
          <input type="text" class="w-1/2 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Value"
                 bind:value="{$form.headerOne.value}">
        </div>
        <div class="flex justify-between">
          <input type="text" class="w-1/2 mr-1 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Key"
                 bind:value="{$form.headerTwo.key}">
          <input type="text" class="w-1/2 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Value"
                 bind:value="{$form.headerTwo.value}">
        </div>
        <div class="flex justify-between">
          <input type="text" class="w-1/2 mr-1 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Key"
                 bind:value="{$form.headerThree.key}">
          <input type="text" class="w-1/2 p-2 mb-4 bg-primary-800 rounded-md text-sm" placeholder="Value"
                 bind:value="{$form.headerThree.value}">
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-row-reverse">
    <button type="submit" class="bg-primary-900 p-2 rounded-md m-2 w-24 hover:bg-primary-500 transition-colors">
      Send
    </button>

    <button type="button" class="p-2 rounded-md m-2 w-24 bg-primary-700 hover:bg-primary-500 border border-primary-300 transition-colors"
            on:click={() => dispatch('cancel')}>
      Cancel
    </button>
  </div>
</form>
