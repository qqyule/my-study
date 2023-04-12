import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { config } from '@/config'
import { isArray } from "lodash-es";
import type { Router } from '@/types'
import { ElMessage } from 'element-plus'
import { Loading } from '@/utils'

// 扫描文件
const files = import.meta.glob(["/src/{views,pages}/**/*", "!**/components"]);

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'HomePage',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: config.app.router.home
      }
    ]
  }
]

const router = createRouter({
  history: config.app.router.mode == 'history' ? createWebHistory() : createWebHashHistory(),
  routes
}) as Router

// 组件加载后
router.beforeResolve(() => {
  Loading.close();
});

// 添加试图，页面路由
router.append = function (data) {
  const list = isArray(data) ? data : [data];

  list.forEach((d) => {
    if (!d.name) {
      d.name = d.path.substring(1);
    }

    if (!d.meta) {
      d.meta = {};
    }

    if (!d.component) {
      const url = d.viewPath;

      if (url) {
        if (url.indexOf("http") == 0) {
          if (d.meta) {
            d.meta.iframeUrl = url;
          }

          d.component = () => import("@/views/frame.vue");
        } else {
          d.component = files["/src/" + url.replace("/", "")];
        }
      } else {
        d.redirect = "/404";
      }
    }

    d.meta.dynamic = true;

    if (d.isPage) {
      router.addRoute(d);
    } else {
      router.addRoute("index", d);
    }
  });
};

let lock = false;
// 错误监听
router.onError((err: any) => {
  if (!lock) {
    lock = true;

    ElMessage.error("页面存在错误或者未配置！");
    console.error(err);

    setTimeout(() => {
      lock = false;
    }, 0);
  }
});

export { router }
