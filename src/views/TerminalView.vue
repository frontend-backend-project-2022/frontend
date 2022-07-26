<template>
  <div class="terminal">
    <div id="xterm-container" style="height: 600px; text-align: left; width: 75%; margin: 20px auto;"></div>
  </div>
</template>

<script>
export default {
  mounted () {
    const term = new this.$xterm.Terminal()
    term.open(document.getElementById('xterm-container'))
    term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m\n $ ')
  }
}
</script>
