import React from "react";
import { Building2, Users } from "lucide-react";
import type { Job } from "@/types";

type Mode = "add" | "view";

interface JobCardProps {
  job: Job;
  onAddCandidate: () => void;
  onViewCandidates: () => void;
  isAdded: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  mode: Mode;
  isSelected?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onAddCandidate,
  onViewCandidates,
  isAdded,
  isLoading,
  isProcessing = false,
  mode,
  isSelected = false,
}) => {
  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        isSelected
          ? "border-purple-400 bg-purple-50/50 shadow-sm"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
      onClick={() => {
        if (mode === "view") {
          onViewCandidates();
        } else if (!isProcessing) {
          window.open(
            `${import.meta.env.VITE_FRONTEND_URL}/jobs/${job.id}`,
            "_blank"
          );
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {job.job_title}
            </h3>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>{job.company_name}</span>
              </div>
              {job.num_candidates !== undefined && job.num_candidates > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{job.num_candidates} candidates</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === "add" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isProcessing) onAddCandidate();
                }}
                className={`px-4 py-2 rounded-lg transition-colors text-base font-medium ${
                  isAdded
                    ? "bg-green-100 text-green-700 cursor-default"
                    : isLoading
                    ? "bg-gray-100 text-gray-400 cursor-wait"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
                disabled={isAdded || isLoading || isProcessing}
              >
                {isAdded ? "Added" : isLoading ? "Adding..." : "Add"}
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCandidates();
                }}
                className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors text-base font-medium"
              >
                View
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
