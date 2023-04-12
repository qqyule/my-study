import { reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { service } from "@/service";
import { useBrowser } from "./browser";
// import { useMitt } from "./mitt";

/**
 * @description: 引用DOM元素，替代document.getElementById
 */
export function useRefs() {
  const refs = reactive<{ [key: string]: any }>({});
  function setRefs(name: string) {
    return (el: any) => {
      refs[name] = el;
    };
  }

  return { refs, setRefs };
}

/**
 * @description: 所有use函数的集合
 */
export function useMy() {
  return {
    service,
    route: useRoute(),
    router: useRouter(),
    // mitt: useMitt(),
    ...useBrowser(),
    ...useRefs()
  };
}

export * from './hmr'
export * from './browser'
