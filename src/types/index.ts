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
