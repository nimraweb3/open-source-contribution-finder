import { useBookmarks } from "../context/BookmarksContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { CircleDot, Bookmark, Menu, X, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./UI";

export function Logo() {
  return (
    <Link to="/" className="brand">
      <CircleDot size={25} />
      <span>
        Contribution<span className="brand-light"> Finder</span>
      </span>
    </Link>
  );
}
export function Navbar() {
  const [mobile, setMobile] = useState(false);
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  useEffect(() => {
    setMobile(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobile(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="header">
      <div className="nav container">
        <Logo />
        <nav
          className={`nav-links ${mobile ? "mobile-open" : ""}`}
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            end
            className={() =>
              ["/", "/browse"].includes(location.pathname) ? "active" : ""
            }
          >
            <CircleDot size={16} /> Explore issues
          </NavLink>
          <NavLink to="/dashboard">
            <Bookmark size={16} /> My contributions
          </NavLink>
          <NavLink to="/gsoc">
            <GraduationCap size={16} /> GSoC organizations
          </NavLink>
        </nav>
        <div className="nav-actions">
          <button
            className="icon-button theme-toggle"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <Button to="/profile" variant="secondary">
              {user.avatar ? (
                <img
                  className="avatar"
                  src={user.avatar}
                  alt=""
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="avatar avatar-fallback" aria-hidden="true">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="profile-name">{user.name.split(" ")[0]}</span>
            </Button>
          ) : (
            <>
              <Link className="login-link" to="/login">
                Sign in
              </Link>
              <Button to="/signup" variant="secondary">
                Sign up
              </Button>
            </>
          )}
          <button
            className="mobile-toggle icon-button"
            aria-label="Toggle navigation"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer container">
      <span>
        Contribution Finder <span className="footer-divider">/</span> A place to
        find something to work on.
      </span>
      <div>
        <a href="https://github.com" target="_blank" rel="noreferrer">
          GitHub <ExternalLink size={12} />
        </a>
        <span>Independent project. Not affiliated with GitHub.</span>
      </div>
    </footer>
  );
}

export function BookmarkNotice() {
  const { error, retry } = useBookmarks();
  const { sessionError, retrySession } = useAuth();
  if (sessionError)
    return (
      <div className="container scope-note" role="alert">
        {sessionError}{" "}
        <button className="text-link" onClick={retrySession}>
          Retry session
        </button>
      </div>
    );
  return error ? (
    <div className="container scope-note" role="alert">
      {error}{" "}
      <button className="text-link" onClick={retry}>
        Retry
      </button>
    </div>
  ) : null;
}
