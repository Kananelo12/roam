/**
 * The browser returns from Google sign-in through an `sso-callback` deep link.
 * While the app is alive, useSSO() reads that URL from its auth session, so the
 * router ignores it and the guard moves the guest to home once the session is
 * set. If Android killed the app while the browser was open (common on
 * low-memory phones), the flow is lost: send the guest to sign-in to retry.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  if (!path.includes("sso-callback")) return path;
  return initial ? "/sign-in?sso=interrupted" : null;
}
