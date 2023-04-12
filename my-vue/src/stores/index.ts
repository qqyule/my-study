import { useUserStore } from "./user";
import { useAppStore } from "./app";
import { useMenuStore } from './menu'

export function useStore() {

	const user = useUserStore();
	const app = useAppStore()
	const menu = useMenuStore()
	return {
		user,
		app,
		menu
	};
}
