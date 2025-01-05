import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Styx: LinkedIn Profile Evaluator",
    description: "Evaluate LinkedIn profiles against job descriptions",
    permissions: ["activeTab", "scripting", "storage"],
    version: "1.0",
  },
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  outDir: "dist",
});
