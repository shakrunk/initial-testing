// ===== UTILITIES =====

export function showToast(message) {
  let toast = document.getElementById("toastNotification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastNotification";
    toast.className = "toast-notification";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("visible");

  // Reset any existing timeout
  if (toast.timeoutId) clearTimeout(toast.timeoutId);

  toast.timeoutId = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2500);
}

// Safe localStorage wrapper to prevent crashes when storage is disabled/full
export const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      // Storage might be disabled or full
      // We suppress the error to prevent app crash, but return null
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Storage might be disabled or full
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Storage might be disabled
    }
  }
};
