import React, { useState, useEffect, useMemo } from "react";
import type { Candidate, Job } from "@/types";
import { CandidateRow } from "./CandidateRow";
import { CandidateSidebar } from "../sidebar/CandidateSidebar";
import { getCandidates, deleteCandidate } from "../../utils/apiUtils";
import { Loader2, Pencil, Star, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface CandidatesListProps {
  jobId: string;
  filterTraits?: string[];
  jobTitle?: string;
}

interface LoadingStates {
  [key: string]: { email: boolean; message: boolean };
}

interface TraitFilterProps {
  job: Job;
  onFilterChange: (traits: string[]) => void;
}

const TraitFilter: React.FC<TraitFilterProps> = ({ job, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const popoverRef = React.useRef<HTMLDivElement>(null);

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
  }, [job.id, onFilterChange]);

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

  // Group traits by required/optional
  const requiredTraits =
    job.key_traits?.filter((trait) => trait.includes("required")) || [];
  const optionalTraits =
    job.key_traits?.filter((trait) => !trait.includes("required")) || [];

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
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : "border-gray-200 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
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

const ProcessingCandidateRow: React.FC<{
  candidate: Candidate;
}> = ({ candidate }) => (
  <tr className="cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
    <td className="px-6 py-4 whitespace-nowrap max-w-[200px]">
      <div className="flex flex-col">
        <div className="text-lg font-medium text-gray-900 truncate">
          {candidate.name}
        </div>
        <div className="text-base text-gray-500 truncate">
          <Skeleton className="h-4 w-[140px]" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center max-w-[60px] min-w-[60px]">
      <Skeleton className="h-8 w-[60px] mx-auto rounded-full" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center min-w-[100px]">
      <div className="flex flex-col items-center gap-2 text-base">
        <Skeleton className="h-5 w-[100px]" />
        <Skeleton className="h-5 w-[80px]" />
      </div>
    </td>
  </tr>
);

const LoadingIndicatorCard: React.FC<{
  loadingCandidates: Candidate[];
}> = ({ loadingCandidates }) => {
  if (loadingCandidates.length === 0) return null;

  const totalCandidatesLoading = loadingCandidates.reduce((sum, candidate) => {
    const match = candidate.name?.match(/Loading (\d+) candidates/);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);

  return (
    <div className="mx-6 mb-4 rounded-lg bg-purple-100 border border-purple-200 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-base text-purple-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>
            Processing {totalCandidatesLoading} new candidate
            {totalCandidatesLoading !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export const CandidatesList: React.FC<CandidatesListProps> = ({
  jobId,
  filterTraits,
  jobTitle,
}) => {
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
  const [job, setJob] = useState<Job | null>(null);

  const fetchCandidates = async (isPolling = false) => {
    try {
      if (!isPolling) {
        setLoading(true);
      }
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
      if (!isPolling) {
        setLoading(false);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCandidates(false);
  }, [jobId, selectedTraits]);

  // Polling when there are processing candidates
  useEffect(() => {
    const hasProcessingCandidates = candidates.some(
      (candidate) => candidate.status === "processing"
    );

    if (hasProcessingCandidates) {
      const interval = setInterval(() => fetchCandidates(true), 2000);
      return () => clearInterval(interval);
    }
  }, [candidates, jobId, selectedTraits]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/jobs/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${await chrome.runtime.sendMessage({
                type: "GET_AUTH_TOKEN",
              })}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setJob(data.job);
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleDelete = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation();
    if (!candidateId || !jobId) return;

    try {
      await deleteCandidate(jobId, candidateId);
      setCandidates((prevCandidates) =>
        prevCandidates.filter((c) => c.id !== candidateId)
      );

      if (
        selectedIndex !== null &&
        candidates[selectedIndex]?.id === candidateId
      ) {
        setSelectedIndex(null);
      } else if (
        selectedIndex !== null &&
        candidates[selectedIndex]?.id !== candidateId
      ) {
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

  const { loadingIndicators, regularCandidates } = useMemo(() => {
    return candidates.reduce(
      (acc, candidate) => {
        if (
          candidate.status === "processing" &&
          candidate.is_loading_indicator
        ) {
          acc.loadingIndicators.push(candidate);
        } else {
          acc.regularCandidates.push(candidate);
        }
        return acc;
      },
      {
        loadingIndicators: [] as Candidate[],
        regularCandidates: [] as Candidate[],
      }
    );
  }, [candidates]);

  // Filter candidates based on status
  const filteredCandidates = regularCandidates.filter(
    (candidate) => candidate.status === statusFilter
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-gray-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => setStatusFilter("complete")}
                className={`px-3 py-1.5 text-base font-medium rounded transition-colors ${
                  statusFilter === "complete"
                    ? "bg-white shadow-sm text-purple-700"
                    : "text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter("processing")}
                className={`px-3 py-1.5 text-base font-medium rounded transition-colors ${
                  statusFilter === "processing"
                    ? "bg-white shadow-sm text-purple-700"
                    : "text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                }`}
              >
                Processing
              </button>
            </div>
            {job && (
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-base font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 hover:border-purple-300"
          >
            <Pencil className="w-4 h-4" />
            Edit Job
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <LoadingIndicatorCard loadingCandidates={loadingIndicators} />
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
                <p className="text-base text-gray-500">
                  No {statusFilter === "complete" ? "completed" : "processing"}{" "}
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
                          className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-base font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Fit
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-base font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Requirements
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCandidates.map((candidate, index) =>
                        candidate.status === "processing" ? (
                          <ProcessingCandidateRow
                            key={candidate.id}
                            candidate={candidate}
                          />
                        ) : (
                          <CandidateRow
                            key={candidate.id}
                            candidate={candidate}
                            onClick={() => setSelectedIndex(index)}
                          />
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

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
