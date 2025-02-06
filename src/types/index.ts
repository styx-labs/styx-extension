export interface EvaluationSection {
  section: string;
  content: string;
  score: number;
}

export interface Citation {
  index: number;
  url: string;
  confidence: number;
  distilled_content: string;
}

export interface EvaluationResponse {
  citations: Citation[];
  sections: EvaluationSection[];
}

export interface Job {
  id: string;
  job_title: string;
  company_name: string;
  job_description?: string;
  key_traits?: string[];
  num_candidates?: number;
}

export interface LinkedinContext {
  context: string;
  name: string;
  public_identifier: string;
}

export interface Candidate {
  id: string;
  name: string;
  url: string;
  status: string;
  sections?: TraitEvaluation[];
  summary?: string;
  fit?: number;
  required_met?: number;
  optional_met?: number;
  profile?: Profile;
  citations?: Array<{
    url: string;
    confidence: number;
    distilled_content: string;
  }>;
}

export interface TraitEvaluation {
  section: string;
  value: boolean;
  content: string;
  required: boolean;
}

export interface Profile {
  full_name: string;
  headline: string;
  occupation: string;
  public_identifier: string;
  summary: string | null;
  source_str: string;
  updated_at: string;
  url: string;
  experiences?: ProfileExperience[];
  education?: ProfileEducation[];
  career_metrics?: CareerMetrics;
}

export interface Experience {
  company?: string;
  title?: string;
  duration?: string;
  description?: string;
}

export interface CareerMetrics {
  total_experience_months: number;
  average_tenure_months: number;
  current_tenure_months: number;
  tech_stacks?: string[];
  career_tags?: string[];
  experience_tags?: string[];
}

export interface ProfileExperience {
  company: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  location: string;
  company_linkedin_profile_url?: string;
  summarized_job_description: AILinkedinJobDescription | null;
  funding_stages_during_tenure?: string[];
}

export interface ProfileEducation {
  degree_name: string;
  field_of_study: string;
  school: string;
  starts_at: string | null;
  ends_at: string | null;
  university_tier?: "top_5" | "top_10" | "top_20" | "top_50" | "other" | null;
}
interface AILinkedinJobDescription {
  role_summary: string;
  skills: string[];
  requirements: string[];
  sources: string[];
}
