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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { AddModeCandidateSidebar } from "../sidebar/AddModeCandidateSidebar";

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
  onViewCandidates: (jobId: string) => void;
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
  addingCandidateId?: string | null;
}

const SELECTED_JOB_KEY = "styx-selected-job-id";

const ModeTabs: React.FC<{ mode: Mode; setMode: (mode: Mode) => void }> = ({
  mode,
  setMode,
}) => (
  <Tabs
    value={mode}
    onValueChange={(value) => setMode(value as Mode)}
    className="w-full"
  >
    <TabsList className="grid w-full grid-cols-2 bg-transparent">
      <TabsTrigger
        value="add"
        className="flex items-center justify-center data-[state=active]:text-purple-600"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        Add
      </TabsTrigger>
      <TabsTrigger
        value="view"
        className="flex items-center justify-center data-[state=active]:text-purple-600"
      >
        <Eye className="w-4 h-4 mr-2" />
        View
      </TabsTrigger>
    </TabsList>
  </Tabs>
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
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      Add Mode
    </label>
    <div className="flex gap-2">
      {enableAddPage && (
        <Button
          variant={addMode === "page" ? "default" : "outline"}
          onClick={() => setAddMode("page")}
          className="text-xs"
        >
          Add Page
        </Button>
      )}
      {enableAddNumber && (
        <Button
          variant={addMode === "number" ? "default" : "outline"}
          onClick={() => setAddMode("number")}
          className="text-xs"
        >
          Add Number
        </Button>
      )}
      {enableAddSelected && (
        <Button
          variant={addMode === "selected" ? "default" : "outline"}
          onClick={() => setAddMode("selected")}
          className="text-xs"
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
    <label htmlFor="numProfiles" className="text-sm font-medium text-gray-700">
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
    className={`w-full text-xs ${
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
  addingCandidateId,
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

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    localStorage.setItem(SELECTED_JOB_KEY, jobId);

    if (mode === "view") {
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        onViewCandidates(jobId);
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

  const enabledModesCount = [
    enableAddPage,
    enableAddNumber,
    enableAddSelected,
  ].filter(Boolean).length;

  return (
    <ExtensionContainer>
      <div className="flex flex-col h-full">
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
              <div className="flex-shrink-0 p-4 space-y-4 bg-white">
                <JobSelector
                  jobs={jobs}
                  selectedJob={selectedJob || null}
                  onJobChange={handleJobChange}
                  className="w-full text-xs"
                />
              </div>

              {mode === "view" && selectedJob ? (
                <div className="flex-1 bg-white">
                  <CandidatesList selectedJob={selectedJob} filterTraits={[]} />
                </div>
              ) : mode === "view" ? (
                <div className="text-gray-600 text-xs text-center p-4">
                  Select a job to start viewing candidates
                </div>
              ) : mode === "add" ? (
                selectedJob && selectedJobId ? (
                  <div className="p-4 space-y-4">
                    {customAddMessage ? (
                      <div className="text-gray-600 text-xs text-center p-4">
                        {customAddMessage}
                      </div>
                    ) : (
                      <>
                        {!isSingleMode && enabledModesCount >= 2 && (
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
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="search-mode"
                                    checked={!!useSearchMode}
                                    onCheckedChange={onSearchModeChange}
                                  />
                                  <Label htmlFor="search-mode">
                                    Search Mode
                                  </Label>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                When enabled, searches through candidate
                                profiles and their previous jobs for better
                                matches, but takes longer to process
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                  <div className="text-gray-600 text-xs text-center p-4">
                    Select a job to start adding candidates
                  </div>
                )
              ) : null}
            </div>
          )}
        </div>
        {!loading &&
          error !== "not_authenticated" &&
          !error &&
          jobs.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2">
              <ModeTabs mode={mode} setMode={setMode} />
            </div>
          )}
      </div>
      {addingCandidateId && selectedJobId && (
        <AddModeCandidateSidebar
          candidateId={addingCandidateId}
          jobId={selectedJobId}
        />
      )}
    </ExtensionContainer>
  );
};

export default JobsActionPanel;
