import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "xanhstay:selected-province";
const EVENT_NAME = "xanhstay:selected-province:change";

export interface SelectedProvince {
  code: string;
  name: string;
}

let listeners: Array<() => void> = [];
function emitChange() {
  window.dispatchEvent(new Event(EVENT_NAME));
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.push(listener);
  const handler = () => listener();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}
function readStorage(): SelectedProvince | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.code === "string" && typeof parsed.name === "string") {
      return parsed as SelectedProvince;
    }
    return null;
  } catch {
    return null;
  }
}

let cached: SelectedProvince | null = readStorage();
function getSnapshot(): SelectedProvince | null {
  const fresh = readStorage();
  if (JSON.stringify(fresh) !== JSON.stringify(cached)) {
    cached = fresh;
  }
  return cached;
}
function getServerSnapshot(): SelectedProvince | null {
  return null;
}

export function useSelectedProvince() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setProvince = useCallback((code: string, name: string) => {
    const next: SelectedProvince = { code, name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cached = next;
    emitChange();
  }, []);

  const clearProvince = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    cached = null;
    emitChange();
  }, []);

  return {
    provinceCode: value?.code ?? null,
    provinceName: value?.name ?? null,
    isReady: value !== null,
    setProvince,
    clearProvince,
  };
}
