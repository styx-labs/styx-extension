import React, { useEffect } from "react";
import { Job } from "@/types";
import { cn } from "@/utils/cn";

const SELECTED_JOB_KEY = "styx-selected-job-id";

interface JobSelectorProps {
  jobs: Job[];
  selectedJob: Job | null;
  onJobChange: (jobId: string) => void;
  className?: string;
}

const JobSelector: React.FC<JobSelectorProps> = ({
  jobs,
  selectedJob,
  onJobChange,
  className,
}) => {
  // Load saved job on mount
  useEffect(() => {
    const savedJobId = localStorage.getItem(SELECTED_JOB_KEY);
    if (
      savedJobId &&
      !selectedJob &&
      jobs.some((job) => job.id === savedJobId)
    ) {
      onJobChange(savedJobId);
    }
  }, [jobs, selectedJob, onJobChange]);

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jobId = e.target.value;
    localStorage.setItem(SELECTED_JOB_KEY, jobId);
    onJobChange(jobId);
  };

  return (
    <div className="relative w-full">
      <select
        value={selectedJob?.id || ""}
        onChange={handleJobChange}
        className={cn(
          "w-full h-auto px-3 py-2 text-lg bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent cursor-pointer",
          className
        )}
      >
        <option value="" disabled>
          Select a job
        </option>
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>
            {job.job_title} at {job.company_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default JobSelector;
