/**
 * Whether a learner who opens the login page is still signed in from earlier (a login saved
 * with "Remember me", or one from this browser session), so the page can send them on.
 * The saved login only counts once the server accepts it; an expired one that can't be
 * renewed is cleared by the API client and the login form stays.
 */
export async function hasResumableSession({ isLocal, hasSession, me }: {
  isLocal: boolean;
  hasSession: () => boolean;
  me: () => Promise<unknown>;
}) {
  // The local demo has no real login: it always shows its account picker.
  if (isLocal || !hasSession()) return false;
  try {
    await me();
    return true;
  } catch {
    return false;
  }
}
