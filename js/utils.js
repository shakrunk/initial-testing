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

// ===== SAFE STORAGE =====

export const safeStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      // Fail securely - do not expose storage errors
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Fail securely - ignore quota or security errors
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Fail securely
    }
  },
};
