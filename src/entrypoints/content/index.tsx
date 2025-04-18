import ReactDOM from "react-dom/client";
import App from "@/App";
import { ContentScriptContext } from "wxt/client";
import DraggableOverlay from "@/components/DraggableOverlay";
import "./style.css";

export default defineContentScript({
  matches: ["*://*.linkedin.com/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    // 3. Define your UI
    const ui = await createUI(ctx);

    // 4. Mount the UI
    ui.mount();
  },
});

function createUI(ctx: ContentScriptContext) {
  return createShadowRootUi(ctx, {
    name: "styx-ui",
    anchor: "body",
    append: "first",
    position: "overlay",
    zIndex: 9999,
    alignment: "top-left",
    onMount: (container) => {
      // Container is a body, and React warns when creating a root on the body, so create a wrapper div
      const shadowDOM = document.createElement("div");

      container.append(shadowDOM);

      // Create a root on the UI container and render a component
      const root = ReactDOM.createRoot(shadowDOM);
      root.render(
        <DraggableOverlay>
          <App />
        </DraggableOverlay>
      );
      return root;
    },
    onRemove: (root) => {
      // Unmount the root when the UI is removed
      root?.unmount();
    },
  });
}
