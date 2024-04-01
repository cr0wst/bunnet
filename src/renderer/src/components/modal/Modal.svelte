<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Icon, XMark } from 'svelte-hero-icons'

  export let open = false
  export let title: string

  const dispatch = createEventDispatcher()
</script>

{#if open}
  <div class="z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8">
    <!-- Modal Overlay -->
    <div class="fixed w-full h-full bg-black opacity-50" on:click={() => dispatch('close')}
    on:keydown={e => e.key === 'Escape' && dispatch('close')}
         role="button" tabindex="0"
    ></div>
    <!-- Begin Modal -->
    <div class="z-50 bg-primary-700 text-primary-200 w-fit rounded-md">
      <div class="flex justify-between items-center pb-2 m-4 text-primary-300 border-b border-b-primary-400">
        {title}
        <button on:click={() => dispatch('close')}>
          <Icon src={XMark} class="w-4 aspect-square" />
        </button>
      </div>
      <div class="p-2">
        <slot name="content" />
      </div>
      <div>
        <slot name="footer" />
      </div>
    </div>
  </div>
{/if}
