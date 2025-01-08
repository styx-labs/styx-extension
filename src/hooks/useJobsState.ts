import { useState, useEffect } from "react";
import { getJobs } from "../utils/apiUtils";
import type { Job } from "../types";

export interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string;
  addedJobs: Set<string>;
  loadingJobs: Set<string>;
  setError: (error: string) => void;
  setAddedJobs: (
    value: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => void;
  setLoadingJobs: (
    value: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => void;
}

export const useJobsState = (): JobsState => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedJobs, setAddedJobs] = useState<Set<string>>(new Set());
  const [loadingJobs, setLoadingJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsList = await getJobs();
        if (jobsList === null) {
          setJobs([]);
          setError("not_authenticated");
        } else {
          setJobs(jobsList.sort((a, b) => a.id.localeCompare(b.id)));
          setError("");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    addedJobs,
    loadingJobs,
    setError,
    setAddedJobs,
    setLoadingJobs,
  };
};
