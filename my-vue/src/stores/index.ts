import { useUserStore } from "./user";
import { useAppStore } from "./app";

export function useStore() {

	const user = useUserStore();
	const add = useAppStore()

	return {
		user
	};
}
