import { useEffect, useState } from "react";
import { api } from "../services/api";
export function useApi<T>(path: string, initialData?: T) {
  const [data, setData] = useState<T | null>(initialData ?? null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!initialData);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api<T>(path, { signal: controller.signal })
      .then((value) => {
        if (active) setData(value);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [path, revision]);
  return { data, error, loading, reload: () => setRevision((n) => n + 1) };
}
