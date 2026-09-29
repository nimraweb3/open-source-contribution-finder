import { Link } from "react-router-dom";

export default function ContributionGuide() {
  return (
    <main className="container page contribution-guide">
      <article>
        <p className="intro-note">Getting started</p>
        <h1 className="page-title">Find your first open source contribution</h1>
        <p className="page-description">
          A useful contribution starts with a small, well-understood problem.
          You can help with documentation, tests, accessibility, or code.
        </p>
        <section>
          <h2>1. Choose a project you can run</h2>
          <p>
            Start with a tool you already use or a language you know. Read the
            README, license, and contribution guide. Try the local setup before
            committing to an issue; setup problems are easier to discover early.
          </p>
          <p>
            <Link className="text-link" to="/browse">
              Search open GitHub issues by language
            </Link>
            , or explore{" "}
            <Link className="text-link" to="/gsoc">
              GSoC organizations and their contribution guides
            </Link>
            .
          </p>
        </section>
        <section>
          <h2>2. Look for a small, available issue</h2>
          <p>
            Try the “good first issue” or “help wanted” filters. Read the entire
            discussion, check for an assignee and linked pull requests, and look
            for recent maintainer activity. Labels are helpful hints, not a
            guarantee that a task is easy or still available.
          </p>
          <p>
            <Link
              className="text-link"
              to="/browse?label=good+first+issue&unassigned=true"
            >
              Browse unassigned good first issues
            </Link>
            . Narrow the results to a language you are comfortable reading.
          </p>
        </section>
        <section>
          <h2>3. Agree on the approach</h2>
          <p>
            Follow the project’s instructions for claiming work. Explain what
            you reproduced and how you plan to fix it. Ask a focused question if
            the expected behavior is unclear. Avoid posting the same generic
            request on many issues.
          </p>
        </section>
        <section>
          <h2>4. Make a focused pull request</h2>
          <p>
            Create a branch, make the smallest useful change, and run the
            project’s relevant checks. Explain the problem, your fix, and how
            you tested it. Link the issue and respond patiently to review
            comments; maintainers often contribute in their spare time.
          </p>
          <p>
            Save issues in Contribution Finder to track work from saved to in
            progress, submitted, and merged. Update the status as you work; the
            tracker does not automatically verify a merge on GitHub.
          </p>
        </section>
        <section>
          <h2>Do I need to be an experienced developer?</h2>
          <p>
            No. Clear bug reports, reproducible examples, documentation fixes,
            and tests can be valuable. Pick a task whose scope you understand
            and follow the community’s contribution guidelines.
          </p>
          <h2>Does a contribution guarantee GSoC selection?</h2>
          <p>
            No. Each organization evaluates applicants and proposals through its
            own process. Use early contributions to understand the project and
            collaborate with its community, and check the official program
            requirements.
          </p>
        </section>
      </article>
    </main>
  );
}
