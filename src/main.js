import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'

const app = createApp(App)
app.use(store)
app.use(router)

app.use(ElementPlus)
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.withCredentials = true
app.config.globalProperties.$axios = axios

router.beforeEach(async (to, from, next) => {
  if (to.name !== 'login' && to.name !== 'register') {
    try {
      await axios.get('/api/login/is_logged_in/')
      next()
    } catch { next('/login/') }
  } else {
    next()
  }
})

app.mount('#app')
