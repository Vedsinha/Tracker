import { createRouter, createWebHistory } from "vue-router";
import AdminView from "./pages/AdminView.vue";
import DashboardView from "./pages/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "dashboard", component: DashboardView },
    { path: "/admin", name: "admin", component: AdminView },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

export default router;
