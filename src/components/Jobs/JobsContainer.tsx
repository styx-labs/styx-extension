import React, { useState } from "react";
import { Sparkles, PlusCircle, Eye, Loader2 } from "lucide-react";
import { useExtensionMode } from "../../hooks/useExtensionMode";
import type { Job } from "../../types";
import {
  LoadingState,
  ErrorState,
  NoJobsState,
  NotLoggedInState,
} from "./shared/JobStates";
import ExtensionContainer from "@/components/ExtensionContainer";
import JobSelector from "./JobSelector";
import CandidatesList from "./CandidatesList";

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
  <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200 text-sm font-medium">
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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
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

const SELECTED_JOB_KEY = "styx-selected-job-id";

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
  selectedJobId: externalSelectedJobId,
}) => {
  const { mode, setMode } = useExtensionMode();
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(() => {
    // Initialize with either external ID, saved ID, or undefined
    const savedJobId = localStorage.getItem(SELECTED_JOB_KEY);
    return (
      externalSelectedJobId ||
      (savedJobId && jobs.some((job) => job.id === savedJobId)
        ? savedJobId
        : undefined)
    );
  });
  const [addMode, setAddMode] = useState<"all" | "selected">("all");
  const [numProfiles, setNumProfiles] = useState<number>(25);

  const selectedJob = jobs.find((job) => job.id === selectedJobId);
  const width = mode === "view" && selectedJobId ? "650px" : "450px";
  const maxHeight =
    mode === "view" && selectedJobId ? "calc(100vh-50px)" : "calc(100vh-100px)";

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    localStorage.setItem(SELECTED_JOB_KEY, jobId);

    if (mode === "view") {
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        onViewCandidates(jobId, job.job_title);
      }
    }
  };

  const handleAdd = () => {
    if (selectedJobId && selectedJob) {
      onAddCandidate(selectedJobId);
    }
  };

  return (
    <ExtensionContainer width={width} maxHeight={maxHeight}>
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
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 p-6 space-y-4">
              <JobSelector
                jobs={jobs}
                selectedJob={selectedJob || null}
                onJobChange={handleJobChange}
                className="w-full text-base"
              />
            </div>

            {mode === "view" && selectedJob && selectedJobId ? (
              <CandidatesList
                jobId={selectedJobId}
                jobTitle={selectedJob.job_title}
              />
            ) : (
              mode === "add" &&
              selectedJob &&
              selectedJobId && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add Mode
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAddMode("all")}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            addMode === "all"
                              ? "bg-purple-600 text-white"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Add All
                        </button>
                        <button
                          onClick={() => setAddMode("selected")}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            addMode === "selected"
                              ? "bg-purple-600 text-white"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          Add Selected Number
                        </button>
                      </div>
                    </div>
                  </div>

                  {addMode === "selected" && (
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="numProfiles"
                        className="block text-sm font-medium text-gray-700 whitespace-nowrap"
                      >
                        Number of candidates:
                      </label>
                      <input
                        id="numProfiles"
                        type="number"
                        min="1"
                        max="100"
                        value={numProfiles}
                        onChange={(e) => {
                          const value = Math.min(
                            Math.max(parseInt(e.target.value) || 1, 1),
                            100
                          );
                          setNumProfiles(value);
                          onNumProfilesChange?.(value);
                        }}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleAdd}
                    disabled={isProcessing || isAdded(selectedJobId)}
                    className={`w-full px-4 py-2 rounded-lg text-base font-medium flex items-center justify-center gap-2 ${
                      isAdded(selectedJobId)
                        ? "bg-green-100 text-green-700 cursor-default"
                        : isProcessing
                        ? "bg-gray-100 text-gray-400 cursor-wait"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <PlusCircle className="w-5 h-5" />
                    )}
                    {isAdded(selectedJobId)
                      ? "Added"
                      : isProcessing
                      ? "Processing..."
                      : `Add ${
                          addMode === "selected" ? numProfiles : "All"
                        } Candidates`}
                  </button>

                  {/* {mode === "add" && onBestFitChange && (
                    <BestFitToggle
                      enabled={showBestFit || false}
                      onChange={onBestFitChange}
                    />
                  )} */}
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
              )
            )}
          </div>
        )}
      </div>
      <ModeTabs mode={mode} onChange={setMode} />
    </ExtensionContainer>
  );
};

export default JobsContainer;
