export const injectExtensionUI = (): HTMLDivElement => {
  // Create new container
  const container = document.createElement("div");
  container.id = "linkedin-evaluator-root";

  // Apply styles for side tab positioning
  container.style.cssText = `
    position: fixed;
    top: 80px;
    right: 0;
    z-index: 9999;
    transition: all 0.3s ease;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    pointer-events: none; /* Make container not interfere with underlying elements */
  `;

  document.body.appendChild(container);
  return container;
};
