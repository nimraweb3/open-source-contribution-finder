import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  Code2,
  GitFork,
  Menu,
  X,
  Compass,
  GitPullRequest,
  BookOpen,
  Heart,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./UI";
export function Logo() {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">
        <Code2 size={22} />
      </span>
      contribution<span className="brand-light">finder</span>
      <span className="brand-dot">.</span>
    </Link>
  );
}
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    setMobile(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="header">
      <div className="nav container">
        <Logo />
        <nav
          className={mobile ? "nav-links mobile-open" : "nav-links"}
          aria-label="Main navigation"
        >
          <div className="menu-wrap">
            <button
              className={`nav-menu ${open ? "active" : ""}`}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              Explore <ChevronDown size={13} />
            </button>
            {open && (
              <div className="mega-menu">
                {[
                  [
                    Compass,
                    "All opportunities",
                    "Find your next meaningful contribution",
                    "/browse",
                  ],
                  [
                    Code2,
                    "Good first issues",
                    "A friendly place to start",
                    "/browse?difficulty=Beginner",
                  ],
                  [
                    GitPullRequest,
                    "Your contributions",
                    "Keep your next big idea moving",
                    "/dashboard",
                  ],
                  [
                    BookOpen,
                    "How it works",
                    "From discovery to your first merge",
                    "/#process",
                  ],
                ].map(([Icon, title, description, to]) => (
                  <Link key={title} to={to} onClick={() => setOpen(false)}>
                    <Icon size={21} />
                    <span>
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </span>
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
              </div>
            )}
          </div>
          <a href="/#process">How it works</a>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <a
            href="https://github.com/topics/open-source"
            target="_blank"
            rel="noreferrer"
          >
            Community <ArrowUpRight size={12} />
          </a>
        </nav>
        <div className="nav-actions">
          {user ? (
            <Button to="/profile" variant="secondary">
              {user.name.split(" ")[0]} <ArrowUpRight size={15} />
            </Button>
          ) : (
            <>
              <Link className="login-link" to="/login">
                Log in
              </Link>
              <Button to="/signup">
                Get started <ArrowUpRight size={16} />
              </Button>
            </>
          )}
          <button
            className="mobile-toggle icon-button"
            onClick={() => setMobile(!mobile)}
            aria-label="Toggle navigation"
            aria-expanded={mobile}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer container">
      <div className="footer-top">
        <div>
          <Logo />
          <p>
            Small commits. Real impact.
            <br />
            Built for the open-source generation.
          </p>
          <a className="social" href="https://github.com" aria-label="GitHub">
            <GitFork size={19} />
          </a>
        </div>
        <div>
          <strong>Discover</strong>
          <Link to="/browse">Explore issues</Link>
          <Link to="/browse?difficulty=Beginner">Good first issues</Link>
          <Link to="/browse?label=help+wanted">Help wanted</Link>
        </div>
        <div>
          <strong>Your workspace</strong>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Your profile</Link>
          <Link to="/signup">Join the community</Link>
        </div>
        <div className="footer-invite">
          <strong>Make your next commit count.</strong>
          <Link to="/browse">
            Find your opportunity <ArrowRight size={17} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Contribution-Finder</span>
        <span>
          Made with <Heart size={12} /> for open source.
        </span>
        <span>Open minds. Open source.</span>
      </div>
    </footer>
  );
}
