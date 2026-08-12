const KEY = "fellx.os.v1";

export function loadJson<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export function saveJson(value: unknown) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}

export function clearOs() {
  localStorage.removeItem(KEY);
}
