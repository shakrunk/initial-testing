// ===== UTILITIES =====

export const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`Storage access blocked for key: ${key}`);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Storage write blocked for key: ${key}`);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Storage delete blocked for key: ${key}`);
    }
  },
};

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
