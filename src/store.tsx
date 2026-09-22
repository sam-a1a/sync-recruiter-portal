import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { seed, type Workspace } from "./data";
const KEY = "sync-recruiter-preview-v1";
function read(): Workspace {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (
      saved?.version === 1 &&
      Array.isArray(saved.jobs) &&
      Array.isArray(saved.candidates) &&
      Array.isArray(saved.applications)
    )
      return saved;
  } catch {
    /* Use a fresh preview if browser storage is unavailable. */
  }
  return structuredClone(seed);
}
const Store = createContext<{
  data: Workspace;
  setData: Dispatch<SetStateAction<Workspace>>;
  notify: (message: string) => void;
  reset: () => void;
} | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(read);
  const [message, setMessage] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* The session remains usable without persistence. */
    }
  }, [data]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(timer);
  }, [message]);
  return (
    <Store.Provider
      value={{
        data,
        setData,
        notify: setMessage,
        reset: () => {
          setData(structuredClone(seed));
          setMessage("Preview restored to its original sample data");
        },
      }}
    >
      {children}
      <div
        className={`snackbar ${message ? "snackbar--visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {message}
      </div>
    </Store.Provider>
  );
}
// Context and provider intentionally share this small module.
// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspace() {
  const context = useContext(Store);
  if (!context) throw new Error("WorkspaceProvider missing");
  return context;
}
