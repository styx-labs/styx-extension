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
