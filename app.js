// app.js — Phase 1: core UI + navigation only

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll("[data-tab-target]");
  const tabPanels = document.querySelectorAll("[data-tab-panel]");

  function activateTab(targetId) {
    tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tabTarget === targetId);
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetId);
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tabTarget;
      activateTab(targetId);
    });
  });

  // Default tab
  activateTab("tab-aircraft");

  // Register service worker (PWA)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch((err) => console.error("SW registration failed:", err));
  }
});
