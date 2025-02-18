import React, { useState, useEffect, useMemo } from "react";
import type { Candidate, Job } from "@/types";
import { CandidateRow } from "./CandidateRow";
import { CandidateSidebar } from "../sidebar/CandidateSidebar";
import { getCandidates, deleteCandidate } from "../../utils/apiUtils";
import { Loader2, Pencil, Star, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { UnifiedFilterMenu } from "./UnifiedFilterMenu";
import { Button } from "@/components/ui/button";

interface CandidatesListProps {
  selectedJob: Job;
  filterTraits?: string[];
}

interface LoadingStates {
  [key: string]: {
    email: boolean;
    message: boolean;
  };
}

export const CandidatesList: React.FC<CandidatesListProps> = ({
  selectedJob,
  filterTraits,
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
  const [selectedCareerTags, setSelectedCareerTags] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedFitScores, setSelectedFitScores] = useState<number[]>([]);

  const fetchCandidates = async (isPolling = false) => {
    try {
      if (!isPolling) {
        setLoading(true);
      }
      const response = await getCandidates(selectedJob.id, selectedTraits);
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
  }, [selectedJob.id, selectedTraits]);

  // Polling when there are processing candidates
  useEffect(() => {
    const hasProcessingCandidates = candidates.some(
      (candidate) => candidate.status === "processing"
    );

    if (hasProcessingCandidates) {
      const interval = setInterval(() => fetchCandidates(true), 2000);
      return () => clearInterval(interval);
    }
  }, [candidates, selectedJob.id, selectedTraits]);

  const handleDelete = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation();
    if (!candidateId || !selectedJob.id) return;

    try {
      await deleteCandidate(selectedJob.id, candidateId);
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

  // Filter candidates based on all criteria
  const filteredCandidates = useMemo(() => {
    return regularCandidates.filter((candidate) => {
      // Status filter
      if (candidate.status !== statusFilter) return false;

      // Fit score filter
      if (
        selectedFitScores.length > 0 &&
        !selectedFitScores.includes(candidate.fit || 0)
      ) {
        return false;
      }

      // Career tags filter
      if (selectedCareerTags.length > 0) {
        const candidateTags =
          candidate.profile?.career_metrics?.career_tags || [];
        if (!selectedCareerTags.every((tag) => candidateTags.includes(tag))) {
          return false;
        }
      }

      // Favorites filter
      if (showFavorites && !candidate.is_favorite) {
        return false;
      }

      // Traits filter is handled by the API call

      return true;
    });
  }, [
    regularCandidates,
    statusFilter,
    selectedFitScores,
    selectedCareerTags,
    showFavorites,
  ]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <UnifiedFilterMenu
              job={selectedJob}
              onTraitFilterChange={setSelectedTraits}
              onCareerTagChange={setSelectedCareerTags}
              onFavoriteChange={setShowFavorites}
              onFitScoreChange={setSelectedFitScores}
              selectedTraits={selectedTraits}
              selectedCareerTags={selectedCareerTags}
              showFavorites={showFavorites}
              selectedFitScores={selectedFitScores}
            />
            <div className="flex items-center bg-gray-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => setStatusFilter("complete")}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  statusFilter === "complete"
                    ? "bg-white shadow-sm text-purple-700"
                    : "text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter("processing")}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  statusFilter === "processing"
                    ? "bg-white shadow-sm text-purple-700"
                    : "text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                }`}
              >
                Processing
              </button>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  `${import.meta.env.VITE_FRONTEND_URL}/jobs/${
                    selectedJob.id
                  }?openEditTraits=true`,
                  "_blank"
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200 hover:border-purple-300"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </div>
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
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-gray-500">
                  No {statusFilter === "complete" ? "completed" : "processing"}{" "}
                  candidates found for this job.
                </p>
              </div>
            ) : (
              <div className="p-4">
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Fit
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
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
          jobId={selectedJob.id}
        />
      )}
    </div>
  );
};

const ProcessingCandidateRow: React.FC<{
  candidate: Candidate;
}> = ({ candidate }) => (
  <tr className="cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
    <td className="px-6 py-4 whitespace-nowrap max-w-[200px]">
      <div className="flex flex-col">
        <div className="text-sm font-medium text-gray-900 truncate">
          {candidate.name}
        </div>
        <div className="text-xs text-gray-500 truncate">
          <Skeleton className="h-4 w-[140px]" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap max-w-[80px] min-w-[80px]">
      <Skeleton className="h-8 w-[80px] mx-auto rounded-full" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center min-w-[100px]">
      <div className="flex flex-col items-center gap-2 text-xs">
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
    <div className="mx-6 my-4 rounded-lg bg-purple-100 border border-purple-200 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-purple-700">
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

export default CandidatesList;
