<template>
  <div class="terminal">
    <div id="xterm-container"></div>
  </div>
</template>

<script>
export default {
  mounted () {
    const term = new this.$xterm.Terminal()
    const fitAddon = new this.$xterm.FitAddon()
    term.loadAddon(fitAddon)
    term.open(document.getElementById('xterm-container'))
    fitAddon.fit()

    const socket = this.$io('http://localhost:5000')
    term.onData(chunk => {
      socket.emit('message', chunk)
    })
    socket.emit('connectSignal', 'Dave', () => {
      console.log(socket.id) // x8WIv7-mJelg7on_ALbx
    })
    socket.on('response', (data) => {
      term.write(data)
    })
  }
}
</script>

<style scoped>
.terminal {
  height: 400px;
  text-align: left;
  width: 50%;
  margin: 20px auto;
}
</style>
