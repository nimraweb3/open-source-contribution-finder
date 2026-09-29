export const directory =
  "https://summerofcode.withgoogle.com/programs/2026/organizations";
export const verifiedAt = "2026-09-28";
// Curated starting points, verified against the official 2026 directory.
// Repository lists are focused entry points, not exhaustive organization inventories.
export const organizations = [
  {
    issueTracker: "https://code.djangoproject.com/query?status=!closed&easy=1",
    trackerNote:
      "Django tracks issues on its own tracker, rather than GitHub. Browse easy pickings there.",
    id: "django",
    name: "Django Software Foundation",
    description:
      "Build and improve the Python web framework, including its documentation and developer experience.",
    technologies: ["Python", "JavaScript", "Web"],
    repositories: ["django/django"],
    website: "https://www.djangoproject.com/",
    guide: "https://docs.djangoproject.com/en/dev/internals/contributing/",
  },
  {
    id: "sympy",
    name: "SymPy",
    description:
      "Work on symbolic mathematics, algebra, and scientific computing in Python.",
    technologies: ["Python", "Mathematics"],
    repositories: ["sympy/sympy"],
    website: "https://www.sympy.org/",
    guide: "https://docs.sympy.org/latest/contributing/",
  },
  {
    id: "kornia",
    name: "Kornia",
    description:
      "Contribute to computer vision and differentiable image processing built on PyTorch.",
    technologies: ["Python", "PyTorch", "AI"],
    repositories: ["kornia/kornia"],
    website: "https://kornia.org/",
    guide: "https://github.com/kornia/kornia/blob/main/CONTRIBUTING.md",
  },
  {
    id: "jenkins",
    name: "Jenkins",
    description:
      "Improve automation, continuous integration, plugins, and documentation.",
    technologies: ["Java", "JavaScript", "Groovy"],
    repositories: ["jenkinsci/jenkins", "jenkins-infra/jenkins.io"],
    website: "https://www.jenkins.io/",
    guide: "https://www.jenkins.io/participate/",
  },
  {
    id: "openmrs",
    name: "OpenMRS",
    description:
      "Help build open-source medical record software and its web interfaces.",
    technologies: ["Java", "TypeScript", "React"],
    repositories: ["openmrs/openmrs-core", "openmrs/openmrs-esm-core"],
    website: "https://openmrs.org/",
    guide: "https://openmrs.org/community/",
  },
  {
    id: "mdanalysis",
    name: "MDAnalysis",
    description:
      "Develop tools for analyzing molecular simulations and scientific data.",
    technologies: ["Python", "Cython", "Science"],
    repositories: ["MDAnalysis/mdanalysis"],
    website: "https://www.mdanalysis.org/",
    guide: "https://userguide.mdanalysis.org/stable/contributing.html",
  },
  {
    id: "dart",
    name: "Dart",
    description:
      "Explore the Dart SDK, language tooling, and packages for building applications.",
    technologies: ["Dart", "C++", "Mobile"],
    repositories: ["dart-lang/sdk"],
    website: "https://dart.dev/",
    guide: "https://github.com/dart-lang/sdk/blob/main/CONTRIBUTING.md",
  },
  {
    id: "openvino",
    name: "OpenVINO",
    description:
      "Help optimize and deploy machine learning models across hardware platforms.",
    technologies: ["C++", "Python", "AI"],
    repositories: ["openvinotoolkit/openvino"],
    website: "https://www.openvino.ai/",
    guide:
      "https://github.com/openvinotoolkit/openvino/blob/master/CONTRIBUTING.md",
  },
].map((org) => ({ ...org, year: 2026, official: directory }));
export function findOrganization(id: unknown) {
  return organizations.find((org) => org.id === id);
}
