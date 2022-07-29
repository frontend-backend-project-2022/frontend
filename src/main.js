import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import * as monaco from 'monaco-editor'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as xterm from 'xterm'
import { AttachAddon } from 'xterm-addon-attach'
import 'xterm/css/xterm.css'
import 'xterm/lib/xterm.js'
import { io } from 'socket.io-client'

const app = createApp(App)
app.use(store)
app.use(router)

app.config.globalProperties.$monaco = monaco
app.use(ElementPlus)
app.config.globalProperties.$xterm = xterm
app.config.globalProperties.$xterm.AttachAddon = AttachAddon
app.config.globalProperties.$io = io

app.mount('#app')
