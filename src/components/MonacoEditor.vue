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
import themeData from 'monaco-themes/themes/LAZY.json'

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
    monaco.editor.defineTheme('mytheme', themeData)
    const editor = monaco.editor.create(document.getElementById('container'), {
      glyphMargin: true,
      lightbulb: {
        enabled: true
      },
      automaticLayout: true,
      minimap: {
        enabled: false
      },
      theme: 'mytheme'
    })
    this.editor = editor

    MonacoServices.install(editor)
    this.socketioList = []
    this.installLanguageServer('python')
    this.installLanguageServer('cpp')
  },
  created () {
    window.addEventListener('beforeunload', () => {
      this.socketioList.forEach(socketio => {
        socketio.disconnect()
      })
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
      this.editor.setModel(textModel)
    },
    installLanguageServer (language) {
      const socketio = io(`http://localhost:5000/${language}`)
      this.socketioList.push(socketio)
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
          name: language,
          clientOptions: {
          // use a language id as a document selector
            documentSelector: [language],
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
