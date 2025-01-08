import React, { useEffect, useState } from "react";
import {
  getJobs,
  getRecommendedJobs,
  openLogin,
  createCandidate,
  getLinkedinContext
} from "../../utils/apiUtils";
import type { Job } from "../../types";
import { Loader2, CircleAlert, Plus, Check, ChevronRight, Sparkles } from "lucide-react";
import { useExtensionState } from "@/hooks/useExtensionState";

const LoadingState = () => (
  <div className="extension-container bg-white rounded-l-lg shadow-lg w-[450px] p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Loading available jobs...
    </h2>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="result-card rounded-xl p-4 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="ml-4 h-9 w-9 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="extension-container bg-white rounded-l-lg shadow-lg w-[450px] p-6">
    <div className="rounded-xl bg-red-50 p-4">
      <div className="flex">
        <CircleAlert className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">{message}</div>
        </div>
      </div>
    </div>
  </div>
);

const NoJobsState = () => (
  <div className="extension-container bg-white rounded-l-lg shadow-lg w-[450px] p-6">
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        No jobs available
      </h2>
      <p className="text-gray-600 mb-6">
        Add jobs through the Styx dashboard to start evaluating candidates.
      </p>
      <a
        href="https://app.styxlabs.co/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary w-full flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-xl"
      >
        <Plus className="-ml-1 mr-2 h-5 w-5" />
        Add Jobs in Styx Dashboard
      </a>
    </div>
  </div>
);

const NotLoggedInState = () => (
  <div className="extension-container bg-white rounded-l-lg shadow-lg w-[450px] p-6">
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Login Required
      </h2>
      <p className="text-gray-600 mb-6">
        Please log in to Styx to view and manage jobs.
      </p>
      <button
        onClick={openLogin}
        className="btn-primary w-full flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-xl"
      >
        <Plus className="-ml-1 mr-2 h-5 w-5" />
        Login to Styx
      </button>
    </div>
  </div>
);

const JobHeader = ({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <div
    className={`flex items-center p-4 border-b border-gray-100 bg-white max-content ${
      isExpanded ? "justify-between" : "justify-center"
    }`}
  >
    <div className="flex items-center gap-2">
      {isExpanded && (
        <a
          href="https://styxlabs.co/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 hover:text-purple-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <img
              src={chrome.runtime.getURL("../../icon/128.png")}
              alt="Styx Logo"
              className="w-6 h-6"
            />
            <h1 className="text-xl font-semibold text-gray-900">Styx</h1>
          </div>
        </a>
      )}
    </div>
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
);

const JobCard = ({
  job,
  onAddCandidate,
  isAdded,
  isLoading,
}: {
  job: Job;
  onAddCandidate: (id: string) => void;
  isAdded: boolean;
  isLoading: boolean;
}) => (
  <div
    className="result-card rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
    onClick={(e) => {
      // Prevent redirect if clicking the add candidate button
      if (!(e.target as HTMLElement).closest("button")) {
        window.open(`https://app.styxlabs.co/jobs/${job.id}`, "_blank");
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

const BestFitToggle = ({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) => (
  <div className="flex items-center justify-start mb-7 space-x-10 divide-x">
    <span className="text-sm text-gray-600">Get recommended roles for this candidate</span>
    <button
      onClick={() => onChange(!enabled)}
      className={`p-2 rounded-lg transition-colors border ${
        enabled 
          ? 'bg-purple-600 text-white hover:bg-gray-800' 
          : 'bg-white text-purple-600 border-gray-200 hover:border-gray-300'
      }`}
      title={enabled ? 'Show all jobs' : 'Show best fit roles'}
    >
      <Sparkles className="w-5 h-5" />
    </button>
  </div>
);

const JobsList: React.FC = () => {
  const { isExpanded, toggleExpansion } = useExtensionState();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [addedJobs, setAddedJobs] = useState<Set<string>>(new Set());
  const [loadingJobs, setLoadingJobs] = useState<Set<string>>(new Set());
  const [showBestFit, setShowBestFit] = useState(false);
  const [linkedinContext, setLinkedinContext] = useState("");
  const [name, setName] = useState("");
  const [publicIdentifier, setPublicIdentifier] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        if (showBestFit && !name && !publicIdentifier && !linkedinContext) {
          const linkedinResponse = await getLinkedinContext(currentUrl);
          setLinkedinContext(linkedinResponse?.context || '');
          setName(linkedinResponse?.name || '');
          setPublicIdentifier(linkedinResponse?.public_identifier || '');
        }
        const jobsList = showBestFit 
          ? await getRecommendedJobs(linkedinContext)
          : await getJobs();
          
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

    setLoading(true);
    fetchJobs();
  }, [showBestFit]);

  React.useEffect(() => {
    setCurrentUrl(window.location.href);

    const observer = new MutationObserver(() => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        setCurrentUrl(newUrl);
        setAddedJobs(new Set());
        setLoadingJobs(new Set());
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [currentUrl]);

  const handleCreateCandidate = async (jobId: string) => {
    try {
      setLoadingJobs((prev) => new Set([...prev, jobId]));
      let response;
      if (name && linkedinContext && publicIdentifier) {
        console.log("name")
        response = await createCandidate(jobId, undefined, name, linkedinContext, publicIdentifier);
      } else {
        console.log("currentUrl")
        response = await createCandidate(jobId, currentUrl);
      }
      if (response === null) {
        setError("not_authenticated");
        return;
      }
      setAddedJobs((prev) => new Set([...prev, jobId]));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create candidate"
      );
    } finally {
      setLoadingJobs((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  if (!currentUrl.includes("linkedin.com/in/")) return null;
  if (loading) return <LoadingState />;
  if (error === "not_authenticated") return <NotLoggedInState />;
  if (error) return <ErrorState message={error} />;
  if (jobs.length === 0) return <NoJobsState />;

  return (
    <div
      className={`extension-container bg-white rounded-l-lg shadow-lg ${
        isExpanded ? "w-[450px]" : "w-20"
      }`}
    >
      <JobHeader isExpanded={isExpanded} onToggle={toggleExpansion} />
      {isExpanded && (
        <div
          className="p-6"
          style={{ maxHeight: "calc(600px - 80px)", overflowY: "auto" }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Click to add a candidate to this job
          </h2>
          <BestFitToggle enabled={showBestFit} onChange={setShowBestFit} />
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onAddCandidate={handleCreateCandidate}
                isAdded={addedJobs.has(job.id)}
                isLoading={loadingJobs.has(job.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsList;
