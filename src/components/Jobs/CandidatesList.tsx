import React, { useState, useEffect } from "react";
import type { Candidate } from "@/types";
import { CandidateRow } from "./CandidateRow";
import { CandidateSidebar } from "../sidebar/CandidateSidebar";
import { getCandidates } from "../../utils/apiUtils";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useExtensionState } from "@/hooks/useExtensionState";

interface CandidatesListProps {
  jobId: string;
  filterTraits?: string[];
  onBack: () => void;
  jobTitle?: string;
}

const Header = ({
  isExpanded,
  onToggle,
  onBack,
  jobTitle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  onBack: () => void;
  jobTitle?: string;
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

const CandidatesList: React.FC<CandidatesListProps> = ({
  jobId,
  filterTraits,
  onBack,
  jobTitle,
}) => {
  const { isExpanded, toggleExpansion } = useExtensionState();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await getCandidates(jobId, filterTraits);
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
  }, [jobId, filterTraits]);

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
      />
      {isExpanded && (
        <div className="flex-1 min-h-0 overflow-y-auto">
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
          ) : candidates.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No candidates found for this job.</p>
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
                    {candidates.map((candidate) => (
                      <CandidateRow
                        key={candidate.id}
                        candidate={candidate}
                        onClick={() => setSelectedCandidate(candidate)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedCandidate && (
        <CandidateSidebar
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};

export default CandidatesList;
