export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  techStack: string[];
  interests: string[];
}
export interface Issue {
  _id: string;
  title: string;
  repository: string;
  language?: string;
  labels: string[];
  description: string;
  url: string;
  source: string;
  number?: number;
  comments?: number;
  state?: string;
  externalUpdatedAt?: string;
  updatedAt: string;
  author?: string;
  assigned?: boolean;
  difficulty?: string;
  stars?: number;
}
export interface Contribution {
  _id: string;
  issue: Issue;
  status: string;
}
export interface SearchResult {
  issues: Issue[];
  total: number;
  page: number;
  pages: number;
  incomplete?: boolean;
  fetchedAt: string;
  scopeNote?: string;
}
export interface Organization {
  issueTracker?: string;
  trackerNote?: string;
  id: string;
  name: string;
  description: string;
  technologies: string[];
  repositories: string[];
  website: string;
  guide: string;
  official: string;
  year: number;
}
export interface OrganizationResult {
  organizations: Organization[];
  year: number;
  verifiedAt: string;
  directory: string;
}
