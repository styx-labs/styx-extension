import React from "react";
import { CircleAlert, Plus, Loader2 } from "lucide-react";
import { openLogin } from "../../../utils/apiUtils";

export const LoadingState = () => (
  <div className="p-6">
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

export const ErrorState = ({ message }: { message: string }) => (
  <div className="p-6">
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

export const NoJobsState = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      No jobs available
    </h2>
    <p className="text-gray-600 mb-6">
      Add jobs through the Styx dashboard to start evaluating candidates.
    </p>
    <a
      href={import.meta.env.VITE_FRONTEND_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-primary w-full flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-xl"
    >
      <Plus className="-ml-1 mr-2 h-5 w-5" />
      Add Jobs in Styx Dashboard
    </a>
  </div>
);

export const NotLoggedInState = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Login Required</h2>
    <p className="text-gray-600 mb-6">
      Please log in to Styx to view and manage jobs. After logging in, you will
      need to refresh the page to see the jobs.
    </p>
    <button
      onClick={openLogin}
      className="btn-primary w-full flex items-center justify-center px-6 py-3 text-base font-medium text-white rounded-xl"
    >
      <Plus className="-ml-1 mr-2 h-5 w-5" />
      Login to Styx
    </button>
  </div>
);
