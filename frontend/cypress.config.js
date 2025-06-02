import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },

  e2e: {
    baseUrl: 'http://192.168.110.155:5173',

    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
    },
  },
});
