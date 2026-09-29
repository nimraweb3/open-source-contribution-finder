import type {
  PropsWithChildren,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
} from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, LoaderCircle, AlertCircle } from "lucide-react";
import { Link, type LinkProps } from "react-router-dom";
type ButtonProps = { variant?: string } & (
  (ButtonHTMLAttributes<HTMLButtonElement> & { to?: never }) | LinkProps
);
export function Button(props: ButtonProps) {
  if ("to" in props && props.to !== undefined) {
    const {
      variant = "primary",
      className = "",
      ...linkProps
    } = props as LinkProps & { variant?: string };
    return <Link className={`button ${variant} ${className}`} {...linkProps} />;
  }
  const {
    variant = "primary",
    className = "",
    ...buttonProps
  } = props as ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string };
  return (
    <button className={`button ${variant} ${className}`} {...buttonProps} />
  );
}
export function Arrow({ size = 18 }) {
  return <ArrowUpRight size={size} aria-hidden="true" />;
}
export function Badge({ children }: PropsWithChildren) {
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
export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
export function Reveal({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
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
export function LoadState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
}) {
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
