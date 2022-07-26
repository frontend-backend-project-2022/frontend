import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as monaco from 'monaco-editor'

const app = createApp(App)
app.use(store)
app.use(router)
app.config.globalProperties.$monaco = monaco
app.mount('#app')