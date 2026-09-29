import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
type Theme = "dark" | "light";
const Context = createContext<{ theme: Theme; toggle: () => void } | null>(
  null,
);
export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem("theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0d1117" : "#ffffff");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* Storage can be disabled in private browsers. */
    }
  }, [theme]);
  return (
    <Context.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useTheme() {
  const context = useContext(Context);
  if (!context) throw new Error("Missing ThemeProvider");
  return context;
}
