import { convexVue } from "convex-vue";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";

const app = createApp(App);

app.use(convexVue, {
  url: import.meta.env.VITE_CONVEX_URL,
});

app.use(router).mount("#app");
