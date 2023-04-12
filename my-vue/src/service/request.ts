import axios from "axios";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { ElMessage } from "element-plus";
import { isDev, config } from "@/config";
import { storage } from "@/utils";
import { useStore } from "@/stores";
import { router } from "@/router";

const request = axios.create({
	timeout: 30000,
	withCredentials: false
});

NProgress.configure({
	showSpinner: true
});

// 请求队列
let queue: Array<(token: string) => void> = [];

// 是否刷新中
let isRefreshing = false;

// 请求
request.interceptors.request.use(
	(req: any) => {
		const { user } = useStore();

		if (req.url) {
			// 请求进度条
			if (!config.ignore.NProgress.some((e) => req.url?.includes(e))) {
				NProgress.start();
			}
		}

		// 请求信息
		if (isDev) {
			console.group(req.url);
			console.log("method:", req.method);
			console.table("data:", req.method == "get" ? req.params : req.data);
			console.groupEnd();
		}

		// 验证 token
		if (user.token) {
			// 请求标识
			if (req.headers) {
				req.headers["Authorization"] = user.token;
			}

			if (req.url?.includes("refreshToken")) {
				return req;
			}

			// 判断 token 是否过期
			if (storage.isExpired("token")) {
				// 判断 refreshToken 是否过期
				if (storage.isExpired("refreshToken")) {
					ElMessage.error("登录状态已失效，请重新登录");
					user.logout();
				} else {
					// 是否在刷新中
					if (!isRefreshing) {
						isRefreshing = true;

						user.refreshToken()
							.then((token) => {
								queue.forEach((cb) => cb(token));
								queue = [];
								isRefreshing = false;
							})
							.catch(() => {
								user.clear();
							});
					}

					return new Promise((resolve) => {
						// 继续请求
						queue.push((token) => {
							// 重新设置 token
							if (req.headers) {
								req.headers["Authorization"] = token;
							}
							resolve(req);
						});
					});
				}
			}
		}

		return req;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// 响应
request.interceptors.response.use(
	(res) => {
		NProgress.done();

		if (!res?.data) {
			return res;
		}

		const { code, data, message } = res.data;

		if (!code) {
			return res.data;
		}

		switch (code) {
			case 1000:
				return data;
			default:
				return Promise.reject({ code, message });
		}
	},
	async (error) => {
		NProgress.done();

		if (error.response) {
			const { status, config: c } = error.response;
			const { user } = useStore();

			if (status == 401) {
				user.logout();
			} else {
				if (isDev) {
					if (c.url != `${config.baseUrl}/`) {
						ElMessage.error(`${c.url} ${status}`);
					}
				} else {
					switch (status) {
						case 403:
							router.push("/403");
							break;

						case 500:
							router.push("/500");
							break;

						case 502:
							router.push("/502");
							break;
					}
				}
			}
		}

		return Promise.reject({ message: error.message });
	}
);

export { request };
