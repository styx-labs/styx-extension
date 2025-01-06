import React from "react";
import { Loader2, Send, AlertCircle } from "lucide-react";
import EvaluationResults from "./EvaluationResults";
import Section from "./Section";
import type { EvaluationResponse } from "@/types";
import ReachoutMessage from "./ReachoutMessage";

interface EvaluationFormProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  loading: boolean;
  error: string;
  evaluation: EvaluationResponse | null;
  onEvaluate: () => void;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  jobDescription,
  setJobDescription,
  loading,
  error,
  evaluation,
  onEvaluate,
}) => {
  return (
    <div className="p-6 space-y-8">
      <Section title="Job Description">
        <textarea
          className="w-full h-32 px-4 py-3 text-base rounded-xl transition-all duration-200"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here (optional)..."
        />
      </Section>

      <button
        onClick={onEvaluate}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
            Analyzing Profile...
          </>
        ) : (
          <>
            <Send className="-ml-1 mr-2 h-5 w-5" />
            Evaluate Profile
          </>
        )}
      </button>

      {error && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {(evaluation || loading) && (
        <>
          {evaluation && !loading && (
            <ReachoutMessage
              jobDescription={jobDescription}
              evaluation={evaluation}
            />
          )}
          <Section title="Evaluation Results">
            <EvaluationResults
              evaluation={evaluation || { sections: [], citations: [] }}
              loading={loading}
            />
          </Section>
        </>
      )}
    </div>
  );
};

export default EvaluationForm;
