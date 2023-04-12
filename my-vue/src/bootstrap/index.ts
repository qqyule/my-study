import { createPinia } from 'pinia'
import type { App } from 'vue'
import { router } from '@/router'
import '@/assets/main.css'
import { createModule } from './module'
import { createEps } from './eps'
import { Loading } from '@/utils'
export async function bootstrap(app: App) {
  // pinia
  app.use(createPinia())

  // 路由
  app.use(router)

  // 模块
  const { eventLoop } = createModule(app)

  // eps
  await createEps()
  // 加载
  Loading.set([eventLoop()])
}
