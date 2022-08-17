<template>
  <div class="editor">
    <div ref="container" id="container"></div>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'
import { WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc'
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices
} from 'monaco-languageclient'
import { io } from 'socket.io-client'

export default {
  name: 'MonacoEditor',
  props: {
    data: String,
    language: String
  },
  data () {
    return {
    }
  },
  mounted () {
    const editor = monaco.editor.create(document.getElementById('container'), {
      glyphMargin: true,
      lightbulb: {
        enabled: true
      },
      automaticLayout: true,
      minimap: {
        enabled: false
      }
    })
    this.editor = editor

    MonacoServices.install(editor)

    const socketio = io('http://localhost:5000/pyls')
    this.socketio = socketio
    socketio.on('connect', () => {
      const socket = socketioToSocketJsonPRC(socketio)
      const reader = new WebSocketMessageReader(socket)
      const writer = new WebSocketMessageWriter(socket)
      const languageClient = createLanguageClient({
        reader,
        writer
      })
      languageClient.start()
      reader.onClose(() => languageClient.stop())
    })

    function createLanguageClient (transports) {
      return new MonacoLanguageClient({
        name: 'Python Language Client',
        clientOptions: {
          // use a language id as a document selector
          documentSelector: ['python'],
          // disable the default error handler
          errorHandler: {
            error: () => ({ action: ErrorAction.Continue }),
            closed: () => ({ action: CloseAction.DoNotRestart })
          }
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
          get: () => {
            return Promise.resolve(transports)
          }
        }
      })
    }

    function socketioToSocketJsonPRC (socketio) {
      return {
        send: content => socketio.emit('receive', content),
        onMessage: cb => {
          socketio.on('send', msg => {
            cb(msg)
          })
        },
        onError: cb => {
          socketio.on('connect_error', event => {
            if ('message' in event) {
              cb(event.message)
            }
          })
        },
        onClose: cb => {
          socketio.on('disconnect', event => cb(event.code, event.reason))
        },
        dispose: () => {
          socketio.disconnect()
        }
      }
    }
  },
  created () {
    window.addEventListener('beforeunload', () => {
      this.socketio.disconnect()
    })
  },
  methods: {
    createTextModel (text, filename) {
      return monaco.editor.createModel(
        text,
        undefined,
        monaco.Uri.file(filename)
      )
    },
    changeModel (textModel) {
      console.log(textModel)
      this.editor.setModel(textModel)
    }
  }
}
</script>

<style scoped>
.editor {
  height: calc(100% - 2px);
  width: calc(100% - 2px);
  letter-spacing: 0;
}

#container {
  height: 100%;
  width: 100%;
  text-align: left;
}
</style>
