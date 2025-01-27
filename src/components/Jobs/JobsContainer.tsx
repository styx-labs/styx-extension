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
  useSelected?: boolean;
  onAddSelectedChange?: (enabled: boolean) => void;
  onNumProfilesChange?: (numProfiles: number) => void;
  isProcessing?: boolean;
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
  <button
    onClick={() => onChange(!enabled)}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-base font-medium ${
      enabled
        ? "bg-purple-600 text-white hover:bg-purple-700"
        : "bg-white text-purple-600 hover:bg-gray-50 border border-gray-200"
    }`}
  >
    <Sparkles className="w-4 h-4" />
    {enabled ? "Show all roles" : "Sort roles by recommended"}
  </button>
);

const AddSelectedToggle = ({
  enabled,
  onChange,
  onNumProfilesChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  onNumProfilesChange?: (numProfiles: number) => void;
}) => (
  <div className="mt-2 mb-4 space-y-2">
    <button
      onClick={() => onChange(!enabled)}
      className="w-full"
    >
      <div className="relative inline-flex items-center w-full max-w-[200px]">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          readOnly
        />
        <div className="w-full h-10 bg-gray-100 rounded-full peer peer-checked:after:translate-x-[100%] after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-10 after:w-[50%] after:transition-all"></div>
        <div className="absolute inset-0 flex items-center justify-between px-4 text-large font-large">
          <span className={'text-gray-600'}>Add #</span>
          <span className={'text-gray-600'}>Add Selected</span>
        </div>
      </div>
    </button>
    {!enabled && onNumProfilesChange && (
      <div className="flex items-center gap-2 max-w-[300px]">
        <label htmlFor="numProfiles" className="text-xl text-gray-600 whitespace-nowrap">Number of candidates:</label>
        <input
          id="numProfiles"
          type="number"
          min="1"
          max="100"
          defaultValue="25"
          onChange={(e) => {
            const value = e.target.value === '' ? '' : Math.min(parseInt(e.target.value) || 1, 100);
            e.target.value = value.toString();
            onNumProfilesChange(value === '' ? 1 : value);
          }}
          className="w-[80px] px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        />
      </div>
    )}
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
  useSelected,
  onAddSelectedChange,
  onNumProfilesChange,
  isProcessing=false,
}) => {
  const { isExpanded, toggleExpansion } = useExtensionState();

  return (
    <div
      className={`extension-container bg-white rounded-l-lg shadow-lg flex flex-col ${
        isExpanded ? "w-[450px] max-h-[calc(100vh-100px)]" : "w-20"
      }`}
    >
      <JobHeader isExpanded={isExpanded} onToggle={toggleExpansion} />
      {isExpanded && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <LoadingState />
          ) : error === "not_authenticated" ? (
            <NotLoggedInState />
          ) : error ? (
            <ErrorState message={error} />
          ) : jobs.length === 0 ? (
            <NoJobsState />
          ) : (
            <div className="flex flex-col">
              <div className="flex-shrink-0 p-6">
                {onAddSelectedChange && (
                  <AddSelectedToggle
                    enabled={useSelected || false}
                    onChange={onAddSelectedChange}
                    onNumProfilesChange={onNumProfilesChange}
                  />
                )}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {title}
                  </h2>
                </div>
                {onBestFitChange && (
                  <BestFitToggle
                    enabled={showBestFit || false}
                    onChange={onBestFitChange}
                  />
                )}
              </div>
              <div className="px-6 pb-6 space-y-3">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onAddCandidate={onAddCandidate}
                    isAdded={isAdded(job.id)}
                    isLoading={isLoading(job.id)}
                    isProcessing={isProcessing}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsContainer;
