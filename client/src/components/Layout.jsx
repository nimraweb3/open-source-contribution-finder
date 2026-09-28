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
  const location = useLocation();
  useEffect(() => {
    setMobile(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    const close = (event) => {
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
          <a
            href="https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project"
            target="_blank"
            rel="noreferrer"
          >
            Contributing guide <ExternalLink size={13} />
          </a>
        </nav>
        <div className="nav-actions">
          {user ? (
            <Button to="/profile" variant="secondary">
              {user.name.split(" ")[0]}
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
