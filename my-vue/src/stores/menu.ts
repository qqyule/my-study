import { ElMessage } from "element-plus";
import { defineStore } from "pinia";
import { ref } from "vue";
import { isEmpty, orderBy } from "lodash-es";
import { config } from "@/config";
import { service } from "@/service";
import { deepTree, revDeepTree, storage, revisePath } from "@/utils";
import type { Menu } from "@/types";

// 本地缓存
const data = storage.info();

export const useMenuStore = defineStore("menu", function () {
  // 视图路由
  const routes = ref<Menu.List>([]);

  // 菜单组
  const group = ref<Menu.List>(data["base.menuGroup"] || []);

  // 顶部菜单序号
  const index = ref(0);

  // 左侧菜单列表
  const list = ref<Menu.List>([]);

  // 权限列表
  const perms = ref<any[]>(data["base.menuPerms"] || []);

  // 设置左侧菜单
  function setMenu(i?: number) {
    if (i === undefined) {
      i = index.value;
    }

    // 显示分组显示菜单
    if (config.app.menu.isGroup) {
      console.log(0)
      list.value = group.value[i]?.children || [];
      index.value = i;
    } else {
      console.log(1)
      list.value = group.value;
    }
  }

  // 设置权限
  function setPerms(list: Menu.List) {
    function deep(d: any) {
      if (typeof d == "object") {
        if (d.permission) {
          d._permission = {};
          for (const i in d.permission) {
            d._permission[i] =
              list.findIndex((e: any) =>
                e
                  .replace(/:/g, "/")
                  .includes(`${d.namespace.replace("admin/", "")}/${i}`)
              ) >= 0;
          }
        } else {
          for (const i in d) {
            deep(d[i]);
          }
        }
      }
    }

    perms.value = list;
    storage.set("base.menuPerms", list);

    deep(service);
  }

  // 设置视图
  function setRoutes(list: Menu.List) {
    routes.value = list;
  }

  // 设置菜单组
  function setGroup(list: Menu.List) {
    group.value = orderBy(list, "orderNum").filter((e) => e.isShow);
    storage.set("base.menuGroup", group.value);
  }

  // 获取菜单，权限信息
  function get() {
    return new Promise((resolve, reject) => {
      function next(res: { menus: Menu.List; perms?: any[] }) {
        const list = res.menus
          ?.filter((e) => e.type != 2)
          .map((e) => {
            return {
              ...e,
              path: revisePath(e.router || String(e.id)),
              isShow: e.isShow === undefined ? true : e.isShow,
              meta: {
                ...e.meta,
                label: e.name,
                keepAlive: e.keepAlive || 0
              },
              children: []
            };
          });

        // 设置权限
        setPerms(res.perms || []);

        // 设置菜单组
        setGroup(deepTree(list));

        // 设置视图路由
        setRoutes(list.filter((e) => e.type == 1));

        // 设置菜单
        setMenu(index.value);

        resolve(list);

        return list;
      }

      // 自定义菜单
      if (!isEmpty(config.app.menu.list)) {
        next({
          menus: revDeepTree(config.app.menu.list || [])
        });
      } else {
        // 动态菜单
        service.base.comm
          .permmenu()
          .then(next)
          .catch((err: any) => {
            ElMessage.error("菜单加载异常！");
            reject(err);
          });
      }
    });
  }

  // 获取菜单路径
  function getPath(item?: Menu.Item) {
    let path = "";

    switch (item?.type) {
      case 0:
        function deep(arr: Menu.List) {
          arr.forEach((e: Menu.Item) => {
            if (e.type == 1) {
              if (!path) {
                path = e.path;
              }
            } else {
              deep(e.children || []);
            }
          });
        }

        deep(item.children || group.value || []);
        break;

      case 1:
        path = item.path;
        break;
    }

    return path || "/";
  }

  return {
    routes,
    group,
    index,
    list,
    perms,
    get,
    setPerms,
    setMenu,
    setRoutes,
    setGroup,
    getPath
  };
});
