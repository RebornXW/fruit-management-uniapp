import {
	createSSRApp
} from "vue";
import App from "./App.vue";

// 无需手动导入uni-ui组件，使用easycom自动导入

export function createApp() {
	const app = createSSRApp(App);
	
	return {
		app,
	};
}
