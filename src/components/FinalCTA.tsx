import { useNavigate } from "react-router-dom";

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-2xl border border-zinc-200 bg-[#fafafa] px-6 py-14 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Your next open-source contribution could be one search away.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-zinc-600">
            Find real GitHub issues that match what you already know and start
            contributing.
          </p>

          <button
            type="button"
            onClick={() => navigate("/explore")}
            className="mt-8 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 active:scale-[0.98]"
          >
            Explore Issues
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
