import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/" className="font-semibold tracking-tight text-zinc-900">
            OS Finder
          </Link>

          <p className="mt-1 text-sm text-zinc-500">
            Find issues. Contribute. Build in public.
          </p>
        </div>

        <div className="flex items-center gap-5 text-sm text-zinc-500">
          <Link to="/explore" className="transition-colors hover:text-zinc-900">
            Explore
          </Link>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-zinc-900"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
