const ADMIN_KEY_STORAGE_NAME =
  import.meta.env.VITE_ADMIN_KEY_STORAGE_NAME || "what-next-admin-key";

export function getAdminKey() {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE_NAME) || "";
}

export function setAdminKey(value) {
  sessionStorage.setItem(ADMIN_KEY_STORAGE_NAME, String(value).trim());
}

export function clearAdminKey() {
  sessionStorage.removeItem(ADMIN_KEY_STORAGE_NAME);
}

export function hasAdminKey() {
  return Boolean(getAdminKey());
}
