const BUYER_SESSION_KEY = 'what-next-buyer-session-v1';

export function readBuyerSession() {
  try {
    const value = JSON.parse(window.localStorage.getItem(BUYER_SESSION_KEY));
    return value?.token && value?.user ? value : null;
  } catch {
    return null;
  }
}

export function saveBuyerSession(session) {
  window.localStorage.setItem(
    BUYER_SESSION_KEY,
    JSON.stringify({
      version: 1,
      portal: 'buyer',
      token: session.token,
      user: session.user
    })
  );
}

export function clearBuyerSession() {
  window.localStorage.removeItem(BUYER_SESSION_KEY);
}
