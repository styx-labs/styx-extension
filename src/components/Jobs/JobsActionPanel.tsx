import React, { useState } from "react";
import { PlusCircle, Eye, Loader2, Check } from "lucide-react";
import { useExtensionMode } from "../../hooks/useExtensionMode";
import type { Job } from "../../types";
import {
  LoadingState,
  ErrorState,
  NoJobsState,
  NotLoggedInState,
} from "./JobStates";
import ExtensionContainer from "@/components/ExtensionContainer";
import JobSelector from "./JobSelector";
import CandidatesList from "./CandidatesList";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
type Mode = "add" | "view";
type AddMode = "page" | "number" | "selected";

interface JobsActionPanelProps {
  title: string;
  onAddCandidate: (
    jobId: string,
    mode: AddMode,
    count?: number,
    selectedIds?: string[]
  ) => void;
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
  enableAddPage?: boolean;
  enableAddNumber?: boolean;
  enableAddSelected?: boolean;
  maxPerPage?: number;
  selectedCandidateIds?: string[];
  isSingleMode?: boolean;
  customAddMessage?: string;
}

const SELECTED_JOB_KEY = "styx-selected-job-id";

const ModeTabs: React.FC<{ mode: Mode; setMode: (mode: Mode) => void }> = ({
  mode,
  setMode,
}) => (
  <div className="border-t p-4">
    <div className="flex justify-center gap-2">
      <Button
        variant={mode === "add" ? "default" : "outline"}
        onClick={() => setMode("add")}
        className="text-base"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        Add Candidates
      </Button>
      <Button
        variant={mode === "view" ? "default" : "outline"}
        onClick={() => setMode("view")}
        className="text-base"
      >
        <Eye className="w-4 h-4 mr-2" />
        View Candidates
      </Button>
    </div>
  </div>
);

const AddModeSelector: React.FC<{
  addMode: AddMode;
  setAddMode: (mode: AddMode) => void;
  enableAddPage: boolean;
  enableAddNumber: boolean;
  enableAddSelected: boolean;
}> = ({
  addMode,
  setAddMode,
  enableAddPage,
  enableAddNumber,
  enableAddSelected,
}) => (
  <div className="flex-1">
    <label className="block text-lg font-semibold text-gray-700 mb-1">
      Add Mode
    </label>
    <div className="flex gap-2">
      {enableAddPage && (
        <Button
          variant={addMode === "page" ? "default" : "outline"}
          onClick={() => setAddMode("page")}
          className="text-base"
        >
          Add Page
        </Button>
      )}
      {enableAddNumber && (
        <Button
          variant={addMode === "number" ? "default" : "outline"}
          onClick={() => setAddMode("number")}
          className="text-base"
        >
          Add Number
        </Button>
      )}
      {enableAddSelected && (
        <Button
          variant={addMode === "selected" ? "default" : "outline"}
          onClick={() => setAddMode("selected")}
          className="text-base"
        >
          Add Selected
        </Button>
      )}
    </div>
  </div>
);

const ProfileCountInput: React.FC<{
  numProfiles: number;
  setNumProfiles: (value: number) => void;
  maxPerPage: number;
}> = ({ numProfiles, setNumProfiles, maxPerPage }) => (
  <div className="flex items-center gap-2">
    <label
      htmlFor="numProfiles"
      className="text-base font-medium text-gray-700"
    >
      Number of candidates:
    </label>
    <Input
      id="numProfiles"
      type="number"
      min={1}
      max={100}
      value={numProfiles}
      onChange={(e) => {
        const value = Math.min(
          Math.max(Number.parseInt(e.target.value) || 1, 1),
          100
        );
        setNumProfiles(value);
      }}
      className="w-20"
    />
  </div>
);

const AddButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
  isProcessing: boolean;
  isSingleMode: boolean;
  addMode: AddMode;
  numProfiles: number;
  isAdded: boolean;
}> = ({
  onClick,
  disabled,
  isProcessing,
  isSingleMode,
  addMode,
  numProfiles,
  isAdded,
}) => (
  <Button
    onClick={onClick}
    disabled={isProcessing || disabled}
    className={`w-full text-base ${
      isAdded ? "bg-green-600 hover:bg-green-700" : ""
    }`}
    variant="default"
  >
    {isProcessing ? (
      <Loader2 className="w-5 h-5 animate-spin" />
    ) : isAdded ? (
      <>
        <Check className="w-5 h-5 mr-2" />
        Added
      </>
    ) : (
      <>
        {isSingleMode
          ? "Add Candidate"
          : addMode === "page"
          ? `Add All on Page`
          : addMode === "number"
          ? `Add ${numProfiles} Candidates`
          : `Add Selected`}
      </>
    )}
  </Button>
);

const JobsActionPanel: React.FC<JobsActionPanelProps> = ({
  onAddCandidate,
  onViewCandidates,
  isAdded,
  jobs,
  loading,
  error,
  isProcessing = false,
  useSearchMode,
  onSearchModeChange,
  selectedJobId: externalSelectedJobId,
  enableAddPage = false,
  enableAddNumber = false,
  enableAddSelected = false,
  maxPerPage = 25,
  selectedCandidateIds = [],
  isSingleMode = false,
  customAddMessage,
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
  const [addMode, setAddMode] = useState<AddMode>(() => {
    if (enableAddPage) return "page";
    if (enableAddNumber) return "number";
    if (enableAddSelected) return "selected";
    return "page"; // fallback to page as default
  });
  const [numProfiles, setNumProfiles] = useState<number>(maxPerPage);

  const selectedJob = jobs.find((job) => job.id === selectedJobId);
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
      if (isSingleMode) {
        onAddCandidate(selectedJobId, "page");
      } else {
        switch (addMode) {
          case "page":
            onAddCandidate(selectedJobId, "page");
            break;
          case "number":
            onAddCandidate(selectedJobId, "number", numProfiles);
            break;
          case "selected":
            onAddCandidate(
              selectedJobId,
              "selected",
              undefined,
              selectedCandidateIds
            );
            break;
        }
      }
    }
  };

  return (
    <ExtensionContainer maxHeight={maxHeight}>
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
              <div className="flex-1 bg-white">
                <CandidatesList
                  jobId={selectedJobId}
                  jobTitle={selectedJob.job_title}
                />
              </div>
            ) : mode === "add" ? (
              selectedJob && selectedJobId ? (
                <div className="p-6 space-y-4">
                  {customAddMessage ? (
                    <div className="text-gray-600 text-base text-center p-4">
                      {customAddMessage}
                    </div>
                  ) : (
                    <>
                      {!isSingleMode && (
                        <AddModeSelector
                          addMode={addMode}
                          setAddMode={setAddMode}
                          enableAddPage={enableAddPage}
                          enableAddNumber={enableAddNumber}
                          enableAddSelected={enableAddSelected}
                        />
                      )}

                      {!isSingleMode && addMode === "number" && (
                        <ProfileCountInput
                          numProfiles={numProfiles}
                          setNumProfiles={setNumProfiles}
                          maxPerPage={maxPerPage}
                        />
                      )}

                      {onSearchModeChange && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-700">
                            Search Mode
                          </span>
                          <Switch
                            checked={useSearchMode || false}
                            onCheckedChange={onSearchModeChange}
                            disabled={isProcessing}
                          />
                        </div>
                      )}

                      <AddButton
                        onClick={handleAdd}
                        disabled={isProcessing || isAdded(selectedJobId)}
                        isProcessing={isProcessing}
                        isSingleMode={isSingleMode}
                        addMode={addMode}
                        numProfiles={numProfiles}
                        isAdded={isAdded(selectedJobId)}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className="text-gray-600 text-base text-center p-4">
                  Select a job to start adding candidates
                </div>
              )
            ) : null}
          </div>
        )}
      </div>
      <ModeTabs mode={mode} setMode={setMode} />
    </ExtensionContainer>
  );
};

export default JobsActionPanel;
