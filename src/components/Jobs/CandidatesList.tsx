import React, { useState, useEffect, useRef } from "react";
import type { Candidate, Job } from "@/types";
import { CandidateRow } from "./CandidateRow";
import { CandidateSidebar } from "../sidebar/CandidateSidebar";
import { getCandidates, deleteCandidate } from "../../utils/apiUtils";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  RefreshCw,
  X,
  Filter,
  Star,
} from "lucide-react";
import { useExtensionState } from "@/hooks/useExtensionState";
import { motion, AnimatePresence } from "framer-motion";

interface CandidatesListProps {
  jobId: string;
  filterTraits?: string[];
  onBack: () => void;
  jobTitle?: string;
  job: Job;
}

interface LoadingStates {
  [key: string]: { email: boolean; message: boolean };
}

interface TraitFilterProps {
  job: Job;
  onFilterChange: (traits: string[]) => void;
}

const Header = ({
  isExpanded,
  onToggle,
  onBack,
  jobTitle,
  jobId,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  onBack: () => void;
  jobTitle?: string;
  jobId: string;
}) => (
  <div
    className={`flex items-center p-4 border-b border-gray-100 bg-white max-content ${
      isExpanded ? "justify-between" : "justify-center"
    }`}
  >
    <div className="flex items-center gap-2">
      {isExpanded && (
        <>
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {jobTitle ? `Candidates for ${jobTitle}` : "Candidates"}
          </h2>
        </>
      )}
    </div>
    <div className="flex items-center gap-2">
      {isExpanded && (
        <>
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
        </>
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

const TraitFilter: React.FC<TraitFilterProps> = ({ job, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedTraits([]);
    onFilterChange([]);
  }, [onFilterChange]);

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits((prev) => {
      const newTraits = prev.includes(trait)
        ? prev.filter((t) => t !== trait)
        : [...prev, trait];
      onFilterChange(newTraits);
      return newTraits;
    });
  };

  const handleClearFilters = () => {
    setSelectedTraits([]);
    onFilterChange([]);
  };

  const hasFilters = selectedTraits.length > 0;

  // Safely get traits with defensive checks
  const traits = job?.key_traits || [];
  const midpoint = Math.ceil(traits.length / 2);
  const requiredTraits = traits.slice(0, midpoint);
  const optionalTraits = traits.slice(midpoint);

  if (!job || !job.key_traits) {
    return null;
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded border border-dashed transition-colors ${
          hasFilters
            ? "border-purple-600 bg-purple-50 text-purple-600"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>Filter by Traits</span>
        {hasFilters && (
          <div className="flex items-center gap-1 border-l border-purple-200 pl-2 ml-2">
            <span className="text-sm">{selectedTraits.length} selected</span>
          </div>
        )}
      </button>

      {hasFilters && (
        <button
          onClick={handleClearFilters}
          className="ml-2 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium">Filter by traits</h3>
              {hasFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
              {requiredTraits.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Required Traits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {requiredTraits.map((trait) => (
                      <button
                        key={trait}
                        onClick={() => handleTraitToggle(trait)}
                        className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full border transition-colors ${
                          selectedTraits.includes(trait)
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : "border-gray-200 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                        }`}
                      >
                        {trait}
                        <Star className="w-3 h-3 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {optionalTraits.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Optional Traits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {optionalTraits.map((trait) => (
                      <button
                        key={trait}
                        onClick={() => handleTraitToggle(trait)}
                        className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full border transition-colors ${
                          selectedTraits.includes(trait)
                            ? "bg-gray-100 text-gray-700 border-gray-200"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {trait}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CandidatesList: React.FC<CandidatesListProps> = ({
  jobId,
  filterTraits,
  onBack,
  jobTitle,
  job,
}) => {
  const { isExpanded, toggleExpansion } = useExtensionState();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const [statusFilter, setStatusFilter] = useState<"complete" | "processing">(
    "complete"
  );
  const [selectedTraits, setSelectedTraits] = useState<string[]>(
    filterTraits || []
  );

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await getCandidates(jobId, selectedTraits);
        if (response === null) {
          setError("not_authenticated");
          return;
        }
        setCandidates(response.candidates);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch candidates"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [jobId, selectedTraits]);

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  };

  // Filter candidates based on status
  const filteredCandidates = candidates.filter(
    (candidate) => candidate.status === statusFilter
  );

  const handleSelectCandidate = (candidate: Candidate, index: number) => {
    setSelectedIndex(index);
  };

  const handleDelete = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation();
    if (!candidateId || !jobId) return;

    try {
      await deleteCandidate(jobId, candidateId);

      // Remove the candidate from the list
      setCandidates((prevCandidates) =>
        prevCandidates.filter((c) => c.id !== candidateId)
      );

      // If the deleted candidate was selected, close the sidebar
      if (
        selectedIndex !== null &&
        candidates[selectedIndex]?.id === candidateId
      ) {
        setSelectedIndex(null);
      } else if (
        selectedIndex !== null &&
        candidates[selectedIndex]?.id !== candidateId
      ) {
        // Adjust selectedIndex if a candidate before the selected one was deleted
        const deletedIndex = candidates.findIndex((c) => c.id === candidateId);
        if (deletedIndex < selectedIndex) {
          setSelectedIndex(selectedIndex - 1);
        }
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < candidates.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <div
      className={`extension-container bg-white rounded-l-lg shadow-lg flex flex-col ${
        isExpanded ? "w-[600px] max-h-[calc(100vh-100px)]" : "w-20"
      }`}
    >
      <Header
        isExpanded={isExpanded}
        onToggle={toggleExpansion}
        onBack={onBack}
        jobTitle={jobTitle}
        jobId={jobId}
      />
      {isExpanded && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-gray-100 rounded-lg p-1 w-fit">
                  <button
                    onClick={() => setStatusFilter("complete")}
                    className={`px-3 py-1.5 text-lg font-medium rounded transition-colors ${
                      statusFilter === "complete"
                        ? "bg-white shadow-sm text-purple-700"
                        : "text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setStatusFilter("processing")}
                    className={`px-3 py-1.5 text-lg font-medium rounded transition-colors ${
                      statusFilter === "processing"
                        ? "bg-white shadow-sm text-purple-700"
                        : "text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                    }`}
                  >
                    Processing
                  </button>
                </div>
                {job && job.key_traits && job.key_traits.length > 0 && (
                  <TraitFilter job={job} onFilterChange={setSelectedTraits} />
                )}
              </div>
              <button
                onClick={() =>
                  window.open(
                    `${
                      import.meta.env.VITE_FRONTEND_URL
                    }/jobs/${jobId}?openEditTraits=true`,
                    "_blank"
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-lg font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 hover:border-purple-300"
              >
                <Pencil className="w-4 h-4" />
                Edit Job
              </button>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={statusFilter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-100 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">
                    No{" "}
                    {statusFilter === "complete" ? "completed" : "processing"}{" "}
                    candidates found for this job.
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Fit
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Requirements
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCandidates.map((candidate, index) => (
                          <CandidateRow
                            key={candidate.id}
                            candidate={candidate}
                            onClick={() =>
                              handleSelectCandidate(candidate, index)
                            }
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {selectedIndex !== null && filteredCandidates[selectedIndex] && (
        <CandidateSidebar
          candidate={filteredCandidates[selectedIndex]}
          onClose={() => setSelectedIndex(null)}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={selectedIndex > 0}
          hasNext={selectedIndex < filteredCandidates.length - 1}
          loadingStates={loadingStates}
          handleDelete={handleDelete}
          jobId={jobId}
        />
      )}
    </div>
  );
};

export default CandidatesList;
