<script lang="ts">
  export let data: object

  function replacer(_, pIndent, pKey, pVal, pEnd) {
    var key = '<span class=json-key>'
    var val = '<span class=json-value>'
    var str = '<span class=json-string>'
    var r = pIndent || ''
    if (pKey) r = r + key + pKey.replace(/[": ]/g, '') + '</span>: '
    if (pVal) r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>'
    return r + (pEnd || '')
  }

  function prettyJson(obj: object) {
    let line = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/gm
    return JSON.stringify(obj, null, 3)
      .replace(/&/g, '&amp;')
      .replace(/\\"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(line, replacer)
  }
</script>

{@html prettyJson(data)}

<style lang="postcss">
  :global(.json-key) {
    @apply text-orange-200;
  }
  :global(.json-value) {
    @apply text-green-100;
  }
  :global(.json-string) {
    @apply text-blue-300;
  }
</style>
