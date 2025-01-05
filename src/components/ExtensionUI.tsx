import React, { useState } from "react";
import EvaluationForm from "./EvaluationForm";
import ExtensionTab from "./ExtensionTab";
import { useExtensionState } from "@/hooks/useExtensionState";
import type { EvaluationResponse } from "../types";
import { evaluateProfile } from "../utils/apiUtils";
import { saveToStorage, loadFromStorage } from "../utils/storage";

const ExtensionUI: React.FC = () => {
  const { isExpanded, toggleExpansion } = useExtensionState();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");

  React.useEffect(() => {
    const loadState = async () => {
      const savedState = await loadFromStorage();
      setJobDescription(savedState.jobDescription);
      setEvaluation(savedState.evaluation);
    };
    loadState();

    setCurrentUrl(window.location.href);

    const observer = new MutationObserver(() => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        setCurrentUrl(newUrl);
        setEvaluation(null);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [currentUrl]);

  const handleEvaluate = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await evaluateProfile(jobDescription, currentUrl);
      setEvaluation(result);
      await saveToStorage({
        jobDescription,
        evaluation: result,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Only show UI on LinkedIn profile pages
  if (!currentUrl.includes("linkedin.com/in/")) {
    return null;
  }

  return (
    <div
      className={`extension-container bg-white rounded-l-lg shadow-lg ${
        isExpanded ? "w-[450px]" : "w-14"
      } ${isExpanded ? "slide-enter" : "slide-exit"}`}
    >
      <div className="flex flex-col">
        <ExtensionTab
          isExpanded={isExpanded}
          onToggle={toggleExpansion}
          loading={loading}
        />
        {isExpanded && (
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(600px - 4rem)" }}
          >
            <EvaluationForm
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              loading={loading}
              error={error}
              evaluation={evaluation}
              onEvaluate={handleEvaluate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtensionUI;
