const KEY = 'what-next-student-session-v1';
export function readStudentSession() {
  try { const value = JSON.parse(window.localStorage.getItem(KEY)); return value?.token && value?.user ? value : null; } catch { return null; }
}
