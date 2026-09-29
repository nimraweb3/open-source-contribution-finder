import type { PropsWithChildren } from "react";
import type { Contribution } from "../types";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";
const Context = createContext<{
  ids: string[];
  mark: (id: string, saved: boolean) => void;
  error: string;
  retry: () => void;
} | null>(null);
export function BookmarksProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.id;
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    setIds([]);
    setError("");
    if (userId)
      api<Contribution[]>("/contributions")
        .then((items) => {
          if (active)
            setIds(
              items.filter((item) => item.issue).map((item) => item.issue._id),
            );
        })
        .catch(() => {
          if (active)
            setError(
              "Saved issues could not be loaded. Retry before changing bookmarks.",
            );
        });
    return () => {
      active = false;
    };
  }, [userId, revision]);
  function mark(id: string, saved: boolean) {
    setIds((previous) =>
      saved
        ? [...new Set([...previous, id])]
        : previous.filter((value) => value !== id),
    );
  }
  return (
    <Context.Provider
      value={{ ids, mark, error, retry: () => setRevision((n) => n + 1) }}
    >
      {children}
    </Context.Provider>
  );
}
export const useBookmarks = () => {
  const context = useContext(Context);
  if (!context) throw new Error("Missing BookmarksProvider");
  return context;
};
