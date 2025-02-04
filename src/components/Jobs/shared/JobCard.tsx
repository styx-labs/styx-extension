import React from "react";
import { Loader2, Plus, Check, Users } from "lucide-react";
import type { Job } from "../../../types";

type Mode = "add" | "view";

interface JobCardProps {
  job: Job;
  onAddCandidate: (id: string) => void;
  onViewCandidates: (jobId: string, jobTitle: string) => void;
  isAdded: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  mode: Mode;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onAddCandidate,
  onViewCandidates,
  isAdded,
  isLoading,
  isProcessing,
  mode,
}) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl p-4 transition-all ${
      mode === "view" ? "hover:shadow-md cursor-pointer" : isProcessing
        ? "opacity-50 cursor-not-allowed"
        : "hover:shadow-md cursor-pointer"
    }`}
    onClick={(e) => {
      if (mode === "view") {
        if (!(e.target as HTMLElement).closest("button")) {
          onViewCandidates(job.id, `${job.company_name} - ${job.job_title}`);
        }
      } else {
        if (isProcessing) return;
        // Prevent redirect if clicking the add candidate button
        if (!(e.target as HTMLElement).closest("button")) {
          window.open(
            `${import.meta.env.VITE_FRONTEND_URL}/jobs/${job.id}`,
            "_blank"
          );
        }
      }
    }}
  >
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">
          {job.company_name} - {job.job_title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {job.job_description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {mode === "add" ? (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when clicking button
              if (!isProcessing) onAddCandidate(job.id);
            }}
            className={`p-2 rounded-lg transition-colors ${
              isAdded
                ? "bg-green-600 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
            title={
              isAdded
                ? "Added as candidate"
                : isProcessing
                ? "Processing..."
                : "Add as candidate"
            }
            disabled={isAdded || isLoading || isProcessing}
          >
            {isAdded ? (
              <Check className="w-5 h-5" />
            ) : isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewCandidates(job.id, `${job.company_name} - ${job.job_title}`);
            }}
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            title="View Candidates"
          >
            <Users className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  </div>
);

export default JobCard;
