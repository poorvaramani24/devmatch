export interface User {
  id: string;
  email: string;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
  last_active: string | null;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  age: number;
  gender: string;
  looking_for: string[];
  bio: string | null;
  avatar_url: string | null;
  photos: string[];
  city: string | null;
  state: string | null;
  country: string;
  role: string;
  years_experience: number;
  company: string | null;
  tech_stack: string[];
  favorite_tools: string[];
  work_style: string;
  github_url: string | null;
  stackoverflow_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  personality: string;
  hobbies: string[];
  matching_mode: string;
  prompt_tabs_open: string | null;
  prompt_toxic_trait: string | null;
  prompt_hill_to_die_on: string | null;
  github_languages: string[];
  github_repos_count: number | null;
  is_visible: boolean;
  created_at: string;
}

export interface DiscoverProfile extends Profile {
  compatibility_score: number;
  badges: string[];
}

export interface Match {
  id: string;
  other_user: Profile;
  compatibility_score: number;
  status: string;
  matched_at: string;
  last_message: string | null;
  unread_count: number;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  content_type: string;
  read_at: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  badge_type: string;
  earned_at: string;
}

export interface BadgeInfo {
  type: string;
  name: string;
  description: string;
  icon: string;
}

export interface LikeResponse {
  liked: boolean;
  matched: boolean;
  match_id: string | null;
  compatibility_score: number | null;
}

export const ROLES = [
  'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer',
  'SDET / QA Engineer', 'DevOps Engineer', 'Data Engineer',
  'ML Engineer', 'Mobile Engineer', 'Product Engineer',
  'Security Engineer', 'Tech Founder', 'Other',
];

export const WORK_STYLES = ['Remote', 'Hybrid', 'Onsite', 'Flexible'];

export const PERSONALITIES = ['Introvert', 'Extrovert', 'Ambivert', 'Builder', 'Researcher', 'Mentor'];

export const MATCHING_MODES = ['Serious Relationship', 'Casual', 'Hackathon Buddy', 'Co-founder Energy'];

export const GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];

export const POPULAR_TECH = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Django', 'Spring',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform',
  'TensorFlow', 'PyTorch', 'Pandas',
  'Selenium', 'Playwright', 'Cypress', 'Jest', 'Pytest',
  'Git', 'GraphQL', 'REST', 'gRPC', 'Kafka',
];

export const POPULAR_TOOLS = [
  'VS Code', 'IntelliJ IDEA', 'Vim', 'Neovim', 'Emacs', 'Sublime Text',
  'iTerm2', 'Warp', 'Figma', 'Postman', 'Docker Desktop',
  'GitHub Copilot', 'Notion', 'Linear', 'Jira', 'Slack',
];
