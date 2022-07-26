import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import * as monaco from 'monaco-editor'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as xterm from 'xterm'
import 'xterm/css/xterm.css'
import 'xterm/lib/xterm.js'

const app = createApp(App)
app.use(store)
app.use(router)

app.config.globalProperties.$monaco = monaco
app.use(ElementPlus)
app.config.globalProperties.$xterm = xterm

app.mount('#app')
