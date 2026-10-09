/**
 * Server data kept in a store: { data, status: 'idle' | 'loading' | 'ready' | 'error', error }.
 * While it reloads, the previous data stays visible.
 */
export const emptyResource = (data) => ({ data, status: 'idle', error: null });

/**
 * Loads fetcher() into state[key] and returns the data (undefined on failure; the error is
 * kept in state[key].error). Every data store has a `session` counter that its reset()
 * bumps on logout/login, so a response from the previous session is dropped instead of
 * showing one user's data to the next.
 */
export async function loadResource(set, get, key, fetcher) {
  const session = get().session;
  set((s) => ({ [key]: { ...s[key], status: 'loading', error: null } }));
  try {
    const data = await fetcher();
    if (get().session === session) set({ [key]: { data, status: 'ready', error: null } });
    return data;
  } catch (e) {
    if (get().session === session) set((s) => ({ [key]: { ...s[key], status: 'error', error: e.message } }));
    return undefined;
  }
}

/** Unwraps the backend's { success, ...payload } envelope. */
export const unwrap = (res, field) => {
  if (res && res.success === false) throw new Error(res.error || 'Request failed');
  return res?.[field];
};
