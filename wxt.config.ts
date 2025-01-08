import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Styx: LinkedIn Profile Evaluator",
    description: "Evaluate LinkedIn profiles against job descriptions",
    permissions: ["storage", "cookies"],
    host_permissions: ["https://app.styxlabs.co/*", "http://localhost:3000/*"],
    version: "1.0",
    web_accessible_resources: [
      {
        matches: ["<all_urls>"],
        resources: ["assets/styx.svg", "icon/*.png"],
      },
    ],
  },
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  outDir: "dist",
});
