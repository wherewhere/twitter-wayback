import { createApp } from "vue";
import { createHead } from "@unhead/vue/client";
import App from "./App.vue";

createApp(App).use(createHead()).mount("#vue-app");