import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: "Styx: LinkedIn Copilot",
    description: "Evaluate LinkedIn profiles with AI at scale",
    permissions: ["storage", "cookies", "scripting", "tabs"],
    host_permissions: [
      "https://app.styxlabs.co/*",
      "http://localhost:3000/*",
      "https://www.linkedin.com/*"
    ],
    version: "1.1.2",
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
