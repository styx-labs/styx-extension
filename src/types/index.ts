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
  job_description: string;
  key_traits: string[];
  company_name: string;
  job_title: string;
}

export interface LinkedinContext {
  name: string;
  context: string;
  public_identifier: string;
}

export interface Candidate {
  id?: string;
  name?: string;
  context?: string;
  status?: "processing" | "complete";
  url?: string;
  summary?: string;
  sections?: TraitEvaluation[];
  citations?: Citation[];
  profile?: Profile;
  created_at?: string;
  search_mode?: boolean;
  required_met?: number;
  optional_met?: number;
  fit?: number;
  traits?: string[];
  evaluation?: {
    score: number;
    traits_met: number;
    total_traits: number;
    trait_scores: number[];
  };
}

export interface TraitEvaluation {
  section: string;
  content: string;
  value: boolean | number | string;
  normalized_score: number;
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
