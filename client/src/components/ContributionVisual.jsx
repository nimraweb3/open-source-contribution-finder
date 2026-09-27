import { motion } from "framer-motion";
import { Terminal, GitBranch, GitPullRequest, Check } from "lucide-react";
export default function ContributionVisual() {
  return (
    <div
      className="contribution-visual"
      aria-label="Illustration of an open-source contribution being merged"
    >
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <span className="orbit-star star-one">✳</span>
      <span className="orbit-star star-two">+</span>
      <div className="floating-label">
        <span className="live-dot" /> YOUR NEXT BIG THING STARTS SMALL
      </div>
      <motion.div
        className="code-window"
        animate={{ y: [0, -9, 0], rotate: -4 }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="code-title">
          <span className="window-dots">
            <i />
            <i />
            <i />
          </span>
          <span>your-first-contribution.ts</span>
          <Terminal size={13} />
        </div>
        <div className="code-body">
          <div>
            <span>01</span>
            <code>
              <b>const</b> developer = {"{"}
            </code>
          </div>
          <div>
            <span>02</span>
            <code>
              {" "}
              curiosity: <em>"endless"</em>,
            </code>
          </div>
          <div>
            <span>03</span>
            <code>
              {" "}
              experience: <em>"just starting"</em>,
            </code>
          </div>
          <div>
            <span>04</span>
            <code>
              {" "}
              readyToContribute: <b>true</b>
            </code>
          </div>
          <div>
            <span>05</span>
            <code>{"}"};</code>
          </div>
          <div>
            <span>06</span>
            <code> </code>
          </div>
          <div>
            <span>07</span>
            <code>
              <b>await</b> makeAnImpact(developer);
            </code>
          </div>
        </div>
        <div className="code-bottom">
          <span>
            <GitBranch size={12} /> feat/your-next-chapter
          </span>
          <span>
            <span className="live-dot" /> ready to build
          </span>
        </div>
      </motion.div>
      <motion.div
        className="merge-card"
        animate={{ y: [0, 7, 0], rotate: 3 }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="merge-icon">
          <GitPullRequest size={23} />
        </span>
        <span>
          <strong>Pull request merged</strong>
          <small>A small commit. A real difference.</small>
        </span>
        <span className="merge-check">
          <Check size={15} />
        </span>
      </motion.div>
      <div className="visual-caption">
        <span className="caption-line" /> LESS SEARCHING. MORE SHIPPING.
      </div>
    </div>
  );
}
