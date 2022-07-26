<template>
  <div class="about">
    <div id="container" style="height: 600px; text-align: left;"></div>
  </div>
</template>

<script>
export default {
  mounted () {
    this.$monaco.editor.create(document.getElementById('container'), {
      value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
      language: 'javascript'
    })
  }
}
</script>
