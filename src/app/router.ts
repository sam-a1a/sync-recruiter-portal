import { useSyncExternalStore } from "react";
import { href, toAppPath } from "./base";
const subscribe = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};
const snapshot = () =>
  toAppPath(window.location.pathname) + window.location.search;
export function navigate(to: string, replace = false) {
  if (snapshot() === to) return;
  window.history[replace ? "replaceState" : "pushState"](null, "", href(to));
  window.dispatchEvent(new PopStateEvent("popstate"));
}
export const usePathname = () => useSyncExternalStore(subscribe, snapshot);
export function useQuery() {
  const location = usePathname();
  const params = new URLSearchParams(location.split("?")[1]);
  return {
    params,
    set: (values: Record<string, string>) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(values)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      navigate(location.split("?")[0] + (next.size ? "?" + next : ""), true);
    },
  };
}
