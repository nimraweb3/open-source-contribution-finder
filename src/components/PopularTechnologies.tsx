import { useNavigate } from "react-router-dom";

const technologies = [
  {
    name: "React",
    description: "Build modern user interfaces",
  },
  {
    name: "TypeScript",
    description: "Write safer JavaScript",
  },
  {
    name: "JavaScript",
    description: "The language of the web",
  },
  {
    name: "Solidity",
    description: "Build smart contracts",
  },
  {
    name: "Python",
    description: "Backend, automation and more",
  },
  {
    name: "Go",
    description: "Build fast backend systems",
  },
];

const PopularTechnologies = () => {
  const navigate = useNavigate();

  const handleTechnologyClick = (technology: string) => {
    navigate(`/explore?q=${encodeURIComponent(technology)}`);
  };

  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-zinc-500">
            POPULAR TECHNOLOGIES
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            Find issues in the stack you use.
          </h2>

          <p className="mt-3 text-zinc-600">
            Explore open-source opportunities across popular technologies.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((technology) => (
            <button
              key={technology.name}
              type="button"
              onClick={() => handleTechnologyClick(technology.name)}
              className="group rounded-xl border border-zinc-200 bg-white p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-900">{technology.name}</h3>

                <span className="text-zinc-400 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-zinc-500">
                {technology.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularTechnologies;
