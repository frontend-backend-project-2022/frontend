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

    const socket = this.$io('http://localhost:5000')
    term.onData(chunk => {
      socket.emit('message', chunk)
    })
    socket.on('connect', () => {
      console.log(socket.id) // x8WIv7-mJelg7on_ALbx
    })
    socket.on('response', (data) => {
      term.write(data)
    })
  }
}
</script>
