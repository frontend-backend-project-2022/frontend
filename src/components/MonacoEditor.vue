<template>
  <div class="editor">
    <div id="container" style="height: 600px; text-align: left;"></div>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor'
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc'
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices
  // MessageTransports
} from 'monaco-languageclient'
import { StandaloneServices } from 'vscode/services'
import getMessageServiceOverride from 'vscode/service-override/messages'

export default {
  name: 'MonacoEditor',
  props: {
    data: String,
    language: String
  },
  mounted () {
    StandaloneServices.initialize({
      ...getMessageServiceOverride(document.body)
    })
    // register Monaco languages
    monaco.languages.register({
      id: 'python',
      extensions: ['.py', '.pyc', '.pyw', 'pyo', 'pyd'],
      aliases: ['python', 'py']
    })
    // create editor
    const editor = monaco.editor.create(document.getElementById('container'), {
      model: monaco.editor.createModel(
        this.data,
        this.language,
        monaco.Uri.parse('inmemory://model.py')
      ),
      glyphMargin: true,
      lightbulb: {
        enabled: true
      }
      // value: this.data,
      // language: this.language
    })
    // emit change when text changed. (auto used by v-model)
    editor.onDidChangeModelContent = (event) => {
      this.$emit('update:data', editor.getValue())
    }
    // install Monaco language client services
    MonacoServices.install(editor)
    // create the web socket
    const url = 'ws://localhost:3001/python'
    const webSocket = new WebSocket(url)
    // connect to python language server when the web socket is opened
    webSocket.onopen = () => {
      const socket = toSocket(webSocket)
      const reader = new WebSocketMessageReader(socket)
      const writer = new WebSocketMessageWriter(socket)
      const languageClient = createLanguageClient({
        reader,
        writer
      })
      languageClient.start()
      reader.onClose(() => languageClient.stop())
    }

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
  }
}
</script>

<style scoped>
</style>
