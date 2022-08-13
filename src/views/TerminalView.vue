<template>
  <div class="terminal">
    <div id="xterm-container"></div>
  </div>
</template>

<script>
import * as xterm from 'xterm'
import 'xterm/css/xterm.css'
import 'xterm/lib/xterm.js'
import { FitAddon } from 'xterm-addon-fit'
import { io } from 'socket.io-client'

export default {
  mounted () {
    const term = new xterm.Terminal()
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(document.getElementById('xterm-container'))
    fitAddon.fit()

    const socket = io('http://localhost:5000')
    term.onData(chunk => {
      socket.emit('message', chunk)
    })
    term.onResize(function (evt) {
      fitAddon.fit()
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
#xterm-container {
  height: 400px;
  text-align: left;
  width: 50%;
  margin: 20px auto;
}
</style>
