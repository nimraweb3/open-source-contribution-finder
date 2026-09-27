export interface IssueLabel {
  name: string;
  color: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  body: string;
  url: string;
  repository: string;
  repositoryUrl: string;
  labels: IssueLabel[];
  comments: number;
  updatedAt: string;
  createdAt: string;
  state: "open" | "closed";
  language: string | null;
  stars: number;
  forks: number;
  matchScore: number | null;
}
