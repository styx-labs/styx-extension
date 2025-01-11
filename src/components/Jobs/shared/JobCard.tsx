import React from "react";
import { Loader2, Plus, Check } from "lucide-react";
import type { Job } from "../../../types";

interface JobCardProps {
  job: Job;
  onAddCandidate: (id: string) => void;
  isAdded: boolean;
  isLoading: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onAddCandidate,
  isAdded,
  isLoading,
}) => (
  <div
    className="result-card rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
    onClick={(e) => {
      // Prevent redirect if clicking the add candidate button
      if (!(e.target as HTMLElement).closest("button")) {
        window.open(`${import.meta.env.VITE_FRONTEND_URL}/jobs/${job.id}`, "_blank");
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
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click when clicking button
          onAddCandidate(job.id);
        }}
        className={`ml-4 p-2 ${
          isAdded
            ? "bg-green-600 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700"
        } text-white rounded-lg transition-colors`}
        title={isAdded ? "Added as candidate" : "Add as candidate"}
        disabled={isAdded || isLoading}
      >
        {isAdded ? (
          <Check className="w-5 h-5" />
        ) : isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Plus className="w-5 h-5" />
        )}
      </button>
    </div>
  </div>
);

export default JobCard;
