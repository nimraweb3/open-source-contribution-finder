const steps = [
  {
    number: "01",
    title: "Tell us what you know",
    description:
      "Choose technologies and skills you're comfortable working with.",
  },
  {
    number: "02",
    title: "Discover matching issues",
    description:
      "Browse real GitHub issues filtered around your skills and interests.",
  },
  {
    number: "03",
    title: "Start contributing",
    description:
      "Open the original issue, understand the task, and make your contribution.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="border-b border-zinc-200 bg-[#fafafa]"
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-zinc-500">HOW IT WORKS</p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            From searching to contributing.
          </h2>

          <p className="mt-3 text-zinc-600">
            A simple workflow for finding open-source work that actually fits
            you.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-zinc-200 bg-white p-6"
            >
              <span className="text-sm font-medium text-zinc-400">
                {step.number}
              </span>

              <h3 className="mt-8 text-lg font-semibold text-zinc-900">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
