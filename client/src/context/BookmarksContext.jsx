import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";
const Context = createContext(null);
export function BookmarksProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [ids, setIds] = useState([]);
  useEffect(() => {
    let active = true;
    setIds([]);
    if (userId)
      api("/contributions")
        .then((items) => {
          if (active)
            setIds(
              items.filter((item) => item.issue).map((item) => item.issue._id),
            );
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [userId]);
  function mark(id, saved) {
    setIds((previous) =>
      saved
        ? [...new Set([...previous, id])]
        : previous.filter((value) => value !== id),
    );
  }
  return <Context.Provider value={{ ids, mark }}>{children}</Context.Provider>;
}
export const useBookmarks = () => useContext(Context);
