import React, { useState } from "react";
import { ClipboardCheck, Loader2, MessageSquare } from "lucide-react";
import Section from "./Section";
import { generateReachout } from "../utils/apiUtils";
import type { EvaluationResponse } from "../types";

interface ReachoutMessageProps {
  jobDescription: string;
  evaluation: EvaluationResponse;
}

const ReachoutMessage: React.FC<ReachoutMessageProps> = ({
  jobDescription,
  evaluation,
}) => {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateMessage = async () => {
    setLoading(true);
    setError("");
    try {
      const reachoutMessage = await generateReachout(
        jobDescription,
        evaluation
      );
      setMessage(reachoutMessage);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate message"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!message && !loading) {
    return (
      <button
        onClick={handleGenerateMessage}
        className="btn-primary w-full flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-xl"
      >
        <MessageSquare className="-ml-1 mr-2 h-5 w-5" />
        Generate Reachout Message
      </button>
    );
  }

  return (
    <Section title="Reachout Message">
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="result-card rounded-xl p-5">
              <p className="whitespace-pre-wrap">{message}</p>
            </div>
            <button
              onClick={handleCopy}
              className="btn-primary w-full flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-xl"
            >
              <ClipboardCheck className="-ml-1 mr-2 h-5 w-5" />
              {copied ? "Copied!" : "Copy Message"}
            </button>
          </div>
        )}
      </div>
    </Section>
  );
};

export default ReachoutMessage;
