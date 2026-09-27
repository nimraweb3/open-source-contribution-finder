const Navbar = () => {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="/"
          className="text-lg font-semibold tracking-tight transition-opacity hover:opacity-70"
        >
          OS Finder
        </a>

        <div className="flex items-center gap-6 text-sm text-zinc-600">
          <a
            href="#how-it-works"
            className="transition-colors hover:text-zinc-900"
          >
            How it works
          </a>

          <a href="#issues" className="transition-colors hover:text-zinc-900">
            Explore Issues
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-zinc-900 transition-all hover:border-zinc-400 hover:bg-zinc-50"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
