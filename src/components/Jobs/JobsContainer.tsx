import React from "react";
import {
  ChevronRight,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Eye,
} from "lucide-react";
import { useExtensionState } from "../../hooks/useExtensionState";
import { useExtensionMode } from "../../hooks/useExtensionMode";
import type { Job } from "../../types";
import JobCard from "./shared/JobCard";
import {
  LoadingState,
  ErrorState,
  NoJobsState,
  NotLoggedInState,
} from "./shared/JobStates";

type Mode = "add" | "view";

interface JobsContainerProps {
  title: string;
  onAddCandidate: (jobId: string) => void;
  onViewCandidates: (jobId: string, jobTitle: string) => void;
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
  useSearchMode?: boolean;
  onSearchModeChange?: (value: boolean) => void;
  selectedJobId?: string;
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
    <div className="flex items-center gap-2">
      {isExpanded && (
        <button
          onClick={() => {
            chrome.runtime.sendMessage({ type: "RELOAD_EXTENSION" });
            window.location.reload();
          }}
          className="w-10 h-10 flex items-center justify-center text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 hover:border-purple-300"
          aria-label="Reload extension"
        >
          <RefreshCw className="w-5 h-5" strokeWidth={2} />
        </button>
      )}
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

const ModeTabs = ({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
}) => (
  <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
    <button
      onClick={() => onChange("add")}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        mode === "add"
          ? "bg-purple-600 text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <PlusCircle className="w-4 h-4" />
      <span>Add</span>
    </button>
    <button
      onClick={() => onChange("view")}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        mode === "view"
          ? "bg-purple-600 text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Eye className="w-4 h-4" />
      <span>View</span>
    </button>
  </div>
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
    <button onClick={() => onChange(!enabled)} className="w-full">
      <div className="relative inline-flex items-center w-full max-w-[200px]">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          readOnly
        />
        <div className="w-full h-10 bg-gray-100 rounded-full peer peer-checked:after:translate-x-[100%] after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-10 after:w-[50%] after:transition-all"></div>
        <div className="absolute inset-0 flex items-center justify-between px-4 text-large font-large">
          <span className={"text-gray-600"}>Add #</span>
          <span className={"text-gray-600"}>Add Selected</span>
        </div>
      </div>
    </button>
    {!enabled && onNumProfilesChange && (
      <div className="flex items-center gap-2 max-w-[300px]">
        <label
          htmlFor="numProfiles"
          className="text-xl text-gray-600 whitespace-nowrap"
        >
          Number of candidates:
        </label>
        <input
          id="numProfiles"
          type="number"
          min="1"
          max="100"
          defaultValue="25"
          onChange={(e) => {
            const value =
              e.target.value === ""
                ? ""
                : Math.min(parseInt(e.target.value) || 1, 100);
            e.target.value = value.toString();
            onNumProfilesChange(value === "" ? 1 : value);
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
  onViewCandidates,
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
  isProcessing = false,
  useSearchMode,
  onSearchModeChange,
  selectedJobId,
}) => {
  const { isExpanded, toggleExpansion } = useExtensionState();
  const { mode, setMode } = useExtensionMode();

  return (
    <div
      className={`extension-container bg-white rounded-l-lg shadow-lg flex flex-col ${
        !isExpanded
          ? "w-20"
          : mode === "view" && selectedJobId
          ? "w-[650px] max-h-[calc(100vh-50px)]"
          : "w-[450px] max-h-[calc(100vh-100px)]"
      }`}
    >
      <JobHeader isExpanded={isExpanded} onToggle={toggleExpansion} />
      {isExpanded && (
        <>
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
                  {mode === "add" && onAddSelectedChange && (
                    <AddSelectedToggle
                      enabled={useSelected || false}
                      onChange={onAddSelectedChange}
                      onNumProfilesChange={onNumProfilesChange}
                    />
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {mode === "add" ? title : "Your Jobs"}
                    </h2>
                  </div>
                  {mode === "add" && onBestFitChange && (
                    <BestFitToggle
                      enabled={showBestFit || false}
                      onChange={onBestFitChange}
                    />
                  )}
                  {mode === "add" && onSearchModeChange && (
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-base text-gray-600">
                        Search Mode
                      </span>
                      <button
                        role="switch"
                        aria-checked={useSearchMode}
                        onClick={() =>
                          !isProcessing && onSearchModeChange(!useSearchMode)
                        }
                        disabled={isProcessing}
                        className={`
                          relative inline-flex h-5 w-9 items-center rounded-full transition-colors 
                          focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-1
                          ${useSearchMode ? "bg-purple-600" : "bg-gray-200"} 
                          ${
                            isProcessing
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform 
                            ${useSearchMode ? "translate-x-5" : "translate-x-1"}
                          `}
                        />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onAddCandidate={onAddCandidate}
                      onViewCandidates={onViewCandidates}
                      isAdded={isAdded(job.id)}
                      isLoading={isLoading(job.id)}
                      isProcessing={isProcessing}
                      mode={mode}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <ModeTabs mode={mode} onChange={setMode} />
        </>
      )}
    </div>
  );
};

export default JobsContainer;
