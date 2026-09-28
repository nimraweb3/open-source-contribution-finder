import { motion } from "framer-motion";
import { ArrowUpRight, LoaderCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
export function Button({
  children,
  to,
  variant = "primary",
  className = "",
  ...props
}) {
  const classes = `button ${variant} ${className}`;
  return to ? (
    <Link className={classes} to={to} {...props}>
      {children}
    </Link>
  ) : (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
export function Arrow({ size = 18 }) {
  return <ArrowUpRight size={size} aria-hidden="true" />;
}
export function Badge({ children }) {
  const tone =
    children === "good first issue"
      ? "good-first"
      : children === "help wanted"
        ? "help-wanted"
        : children === "bug"
          ? "bug"
          : "";
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Field({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
export function Reveal({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.55 }}
    >
      {children}
    </motion.div>
  );
}
export function LoadState({ loading, error, retry }) {
  return loading ? (
    <div className="state" role="status">
      <LoaderCircle className="spin" /> Loading…
    </div>
  ) : error ? (
    <div className="state error" role="alert">
      <AlertCircle />
      <p>{error}</p>
      <Button variant="secondary" onClick={retry}>
        Try again
      </Button>
    </div>
  ) : null;
}
