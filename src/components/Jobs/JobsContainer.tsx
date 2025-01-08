import React from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { useExtensionState } from "@/hooks/useExtensionState";
import type { Job } from "../../types";
import JobCard from "./shared/JobCard";
import {
  LoadingState,
  ErrorState,
  NoJobsState,
  NotLoggedInState,
} from "./shared/JobStates";

interface JobsContainerProps {
  title: string;
  onAddCandidate: (jobId: string) => void;
  isAdded: (jobId: string) => boolean;
  isLoading: (jobId: string) => boolean;
  jobs: Job[];
  loading: boolean;
  error: string;
  showBestFit?: boolean;
  onBestFitChange?: (enabled: boolean) => void;
}

const JobHeader = ({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <div
    className={`flex items-center p-4 border-b border-gray-100 bg-white max-content ${
      isExpanded ? "justify-between" : "justify-center"
    }`}
  >
    <div className="flex items-center gap-2">
      {isExpanded && (
        <a
          href="https://styxlabs.co/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 hover:text-purple-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <img
              src={chrome.runtime.getURL("../../icon/128.png")}
              alt="Styx Logo"
              className="w-6 h-6"
            />
            <h1 className="text-xl font-semibold text-gray-900">Styx</h1>
          </div>
        </a>
      )}
    </div>
    <button
      onClick={onToggle}
      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      aria-label={isExpanded ? "Minimize" : "Expand"}
    >
      {isExpanded ? (
        <ChevronRight className="w-6 h-6" strokeWidth={2} stroke="#9333ea" />
      ) : (
        <img
          src={chrome?.runtime?.getURL("icon/128.png")}
          alt="Styx Logo"
          className="w-6 h-6 object-contain"
        />
      )}
    </button>
  </div>
);

const BestFitToggle = ({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) => (
  <div className="flex items-center justify-start mb-7 space-x-10 divide-x">
    <span className="text-sm text-gray-600">Get recommended roles for this candidate</span>
    <button
      onClick={() => onChange(!enabled)}
      className={`p-2 rounded-lg transition-colors border ${
        enabled 
          ? 'bg-purple-600 text-white hover:bg-gray-800' 
          : 'bg-white text-purple-600 border-gray-200 hover:border-gray-300'
      }`}
      title={enabled ? 'Show all jobs' : 'Show best fit roles'}
    >
      <Sparkles className="w-5 h-5" />
    </button>
  </div>
);

const JobsContainer: React.FC<JobsContainerProps> = ({
  title,
  onAddCandidate,
  isAdded,
  isLoading,
  jobs,
  loading,
  error,
  showBestFit,
  onBestFitChange,
}) => {
  const { isExpanded, toggleExpansion } = useExtensionState();

  if (loading) return <LoadingState />;
  if (error === "not_authenticated") return <NotLoggedInState />;
  if (error) return <ErrorState message={error} />;
  if (jobs.length === 0) return <NoJobsState />;

  return (
    <div
      className={`extension-container bg-white rounded-l-lg shadow-lg ${
        isExpanded ? "w-[450px]" : "w-20"
      }`}
    >
      <JobHeader isExpanded={isExpanded} onToggle={toggleExpansion} />
      {isExpanded && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          {onBestFitChange && (
            <BestFitToggle enabled={showBestFit || false} onChange={onBestFitChange} />
          )}
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onAddCandidate={onAddCandidate}
                isAdded={isAdded(job.id)}
                isLoading={isLoading(job.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsContainer;
