import ContributionVisual from "../components/ContributionVisual";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useScroll, useMotionValueEvent } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  GitPullRequest,
  GitBranch,
  Check,
  Sparkles,
  Terminal,
  GitFork,
  Star,
  Command,
} from "lucide-react";
import { Button, Reveal, LoadState } from "../components/UI";
import IssueCard from "../components/IssueCard";
import { useApi } from "../hooks/useApi";

const projects = [
  "github",
  "◈ vercel",
  "⚛ React",
  "▰ supabase",
  "≋ tailwindcss",
  "✳ Svelte",
  "⬡ node.js",
];
const steps = [
  [
    "Find your fit.",
    "Your skills. Your interests. Your next challenge.",
    [
      "Explore projects you actually care about",
      "Filter by language, difficulty, and labels",
    ],
    Search,
  ],
  [
    "Make your move.",
    "Turn “I could help” into your first commit.",
    [
      "Save opportunities to your workspace",
      "Pick an issue and start building",
    ],
    GitBranch,
  ],
  [
    "Leave your mark.",
    "Small contributions move big ideas forward.",
    [
      "Track your progress from saved to merged",
      "Build confidence with every contribution",
    ],
    GitPullRequest,
  ],
];
export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const processRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const { scrollYProgress } = useScroll({
    target: processRef,
    offset: ["start end", "end center"],
  });
  useMotionValueEvent(scrollYProgress, "change", (value) =>
    setProgress(Math.round(value * 100)),
  );
  const { data, loading, error, reload } = useApi("/issues?sort=stars");
  return (
    <>
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <Reveal>
              <div className="eyebrow">
                <span className="live-dot" /> OPEN SOURCE. OPEN POSSIBILITIES.
              </div>
              <h1>
                Your next commit.
                <br />
                Someone’s next
                <br />
                <span>big thing.</span>
                <span className="headline-asterisk">✳</span>
              </h1>
              <p className="hero-description">
                You don’t need to build the whole thing.
                <br />
                Just the part that makes a difference.
              </p>
              <p className="hero-subtext">
                Find open-source opportunities that fit your skills.
                <br />
                Start small. Build confidence. Make an impact.
              </p>
              <div className="hero-buttons">
                <Button to="/browse">
                  Find your first issue <ArrowUpRight size={19} />
                </Button>
                <a className="text-link" href="#process">
                  How it works <ArrowRight size={17} />
                </a>
              </div>
              <div className="hero-proof">
                <div className="avatar-stack">
                  <span>AK</span>
                  <span>JL</span>
                  <span>MR</span>
                  <span>SD</span>
                </div>
                <div>
                  <span className="proof-stars">★★★★★</span>
                  <small>A little curiosity. A whole lot of possibility.</small>
                </div>
              </div>
            </Reveal>
          </div>
          <ContributionVisual />
          <div className="hero-bottom">
            <span>
              <span className="live-dot" /> GOOD FIRST ISSUES. GREAT NEXT
              CHAPTERS.
            </span>
            <a href="#discover">
              SCROLL TO EXPLORE <span>↓</span>
            </a>
          </div>
        </section>
        <section className="project-strip">
          <div className="container">
            <p>BIG IDEAS. OPEN CODE. YOUR CONTRIBUTION.</p>
            <div className="marquee-mask">
              <div className="project-track">
                {[...projects, ...projects].map((project, i) => (
                  <span key={i} aria-hidden={i >= projects.length}>
                    {project}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="section container discovery" id="discover">
          <Reveal>
            <div className="section-kicker">
              <span>01 / THE OPPORTUNITIES</span>
              <span>YOUR SKILLS BELONG SOMEWHERE.</span>
            </div>
            <div className="section-heading">
              <h2>
                Less searching.
                <br />
                <span className="muted">More contributing.</span>
              </h2>
              <p>
                Somewhere, a project needs exactly what you know.
                <br />
                Let’s help you find it.
              </p>
            </div>
            <form
              className="home-search"
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/browse?q=${encodeURIComponent(query)}`);
              }}
            >
              <Search size={21} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search projects, languages, or issues"
                placeholder="Search projects, languages, or something you care about…"
              />
              <Button type="submit">
                Find my next contribution <ArrowRight size={17} />
              </Button>
            </form>
            <div className="popular">
              <span>A good place to start:</span>
              {["JavaScript", "TypeScript", "Python", "Go", "Rust"].map(
                (language) => (
                  <Link key={language} to={`/browse?language=${language}`}>
                    {language} <ArrowUpRight size={11} />
                  </Link>
                ),
              )}
            </div>
            <LoadState loading={loading} error={error} retry={reload} />
            {data?.issues?.length > 0 && (
              <>
                <div className="featured-label">
                  <span>
                    <Sparkles size={15} /> A FEW PLACES TO MAKE YOUR MARK
                  </span>
                  <span>Sample opportunities</span>
                </div>
                <div className="issue-grid">
                  {data.issues.slice(0, 3).map((issue) => (
                    <IssueCard key={issue._id} issue={issue} />
                  ))}
                </div>
              </>
            )}
            <Link to="/browse" className="browse-all">
              Explore all opportunities <ArrowUpRight size={17} />
            </Link>
          </Reveal>
        </section>
        <section className="process-section" id="process" ref={processRef}>
          <div className="container">
            <div className="section-kicker">
              <span>02 / SMALL STEPS. REAL IMPACT.</span>
              <span>FROM CURIOUS TO CONTRIBUTOR.</span>
            </div>
            <div className="process-heading">
              <Reveal>
                <h2>
                  You’re closer
                  <br />
                  than you <span className="serif-accent">think.</span>
                </h2>
                <p>
                  No perfect résumé. No permission needed.
                  <br />
                  Just a place to start, and the courage to try.
                </p>
              </Reveal>
              <div className="progress-counter">
                <span>
                  {String(progress).padStart(3, "0")}
                  <small>%</small>
                </span>
                <p>FROM “MAYBE” TO “MERGED”</p>
              </div>
            </div>
            <div className="process-grid">
              {steps.map(([title, description, bullets, Icon], i) => (
                <Reveal className="process-card" key={title}>
                  <div className="step-top">
                    <span>0{i + 1}</span>
                    <Icon size={26} />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <ul>
                    {bullets.map((bullet) => (
                      <li key={bullet}>
                        <Check size={13} />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <section
          className="statement-ticker"
          aria-label="Small commits, real impact"
        >
          <div>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} aria-hidden={i > 0}>
                SMALL COMMITS. REAL IMPACT. <span>✳</span> OPEN SOURCE. OPEN
                DOORS. <span>✳</span>{" "}
              </span>
            ))}
          </div>
        </section>
        <section className="section community-section">
          <div className="container">
            <div className="section-kicker">
              <span>03 / BETTER, TOGETHER</span>
              <span>EVERY CONTRIBUTOR STARTS SOMEWHERE.</span>
            </div>
            <div className="section-heading">
              <h2>
                First commits.
                <br />
                <span className="muted">Lasting confidence.</span>
              </h2>
              <p>
                Different backgrounds. Shared curiosity.
                <br />
                One community moving things forward.
              </p>
            </div>
            <p className="demo-note">
              Illustrative contributor stories — not verified reviews.
            </p>
          </div>
          <div className="review-mask">
            <div className="review-track">
              {[...Array(2)].flatMap((_, set) =>
                [
                  [
                    "AK",
                    "Aisha K.",
                    "Frontend developer",
                    "I spent more time looking for the right issue than writing code. Having a clear place to start changes everything.",
                  ],
                  [
                    "JL",
                    "James L.",
                    "First-time contributor",
                    "That first merged pull request is a feeling you don’t forget. Sometimes all you need is a little nudge in the right direction.",
                  ],
                  [
                    "MR",
                    "Maya R.",
                    "Python enthusiast",
                    "Open source finally feels approachable. Small, focused contributions are a great way to learn by doing.",
                  ],
                ].map(([initials, name, role, quote], i) => (
                  <article
                    className="review-card"
                    key={`${set}-${i}`}
                    aria-hidden={set > 0}
                  >
                    <div className="review-stars">
                      ★★★★★ <GitFork size={17} />
                    </div>
                    <blockquote>“{quote}”</blockquote>
                    <div className="review-author">
                      <span className={`avatar avatar-${i}`}>{initials}</span>
                      <span>
                        <strong>{name}</strong>
                        <small>{role}</small>
                      </span>
                      <ArrowUpRight size={17} />
                    </div>
                  </article>
                )),
              )}
            </div>
          </div>
        </section>
        <section className="cta-section container">
          <Reveal>
            <div className="eyebrow">
              <span className="live-dot" /> THE NEXT CHAPTER IS YOURS.
            </div>
            <h2>
              The world runs on open source.
              <br />
              <span>Be part of what’s next.</span>
            </h2>
            <p>
              Your skills matter. Your perspective matters. Your first commit is
              waiting.
            </p>
            <Button to="/signup">
              Let’s make an impact <ArrowUpRight size={19} />
            </Button>
            <small>Free to explore. Open to everyone.</small>
          </Reveal>
          <Command className="cta-decoration" strokeWidth={0.7} />
        </section>
      </main>
    </>
  );
}
