const PARTNER_SESSION_STORAGE_KEY = 'what-next-partner-session-v1';

export function readStoredPartnerSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(PARTNER_SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession);

    if (!parsedSession?.token || !parsedSession?.partner?.officialEmail) {
      return null;
    }

    return {
      token: parsedSession.token,
      partner: parsedSession.partner
    };
  } catch (_error) {
    return null;
  }
}

export function savePartnerSession(session) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    PARTNER_SESSION_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      token: session.token,
      partner: session.partner
    })
  );
}

export function clearPartnerSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(PARTNER_SESSION_STORAGE_KEY);
}

export function buildPartnerSession(responseData) {
  const token = responseData?.token;
  const partner = responseData?.partner;

  if (!token || !partner?.officialEmail) {
    return null;
  }

  return { token, partner };
}
