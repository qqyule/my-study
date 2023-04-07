import { createApp } from 'vue'
import App from './App.vue'
import { bootstrap } from '@/bootstrap'

const app = createApp(App)

bootstrap(app)
  .then(() => {
    app.mount('#app')
  })
  .catch((err) => console.error('项目启动失败', err))
