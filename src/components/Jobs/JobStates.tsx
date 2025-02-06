import { CircleAlert, Plus, Loader2 } from "lucide-react";
import { openLogin } from "@/utils/apiUtils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-full p-6 space-y-4">
    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    <div className="w-full space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-full p-6 space-y-4 gap-2">
    <CircleAlert className="h-8 w-8 text-red-600" />
    <h1 className="text-xl font-semibold text-red-600">Error</h1>
    <p className="text-base text-center text-gray-600">{message}</p>
  </div>
);

export const NoJobsState = () => (
  <div className="flex flex-col items-center justify-center h-full p-6 space-y-4 gap-2">
    <h1 className="text-xl font-semibold text-gray-900">No jobs available</h1>
    <p className="text-base text-center text-gray-600">
      Add jobs through the Styx dashboard to start evaluating candidates.
    </p>
    <Button asChild className="w-full">
      <a
        href={`${import.meta.env.VITE_FRONTEND_URL}/create`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Plus className="mr-2 h-5 w-5" />
        Add Jobs in Styx Dashboard
      </a>
    </Button>
  </div>
);

export const NotLoggedInState = () => (
  <div className="flex flex-col items-center justify-center h-full p-6 space-y-4 gap-2">
    <h1 className="text-xl font-semibold text-purple-600">Login Required</h1>
    <p className="text-base text-center text-gray-600">
      Please log in to Styx to view and manage jobs. After logging in, you will
      need to refresh the page to see the jobs.
    </p>
    <Button onClick={openLogin} className="w-full">
      <Plus className="mr-2 h-5 w-5" />
      Login to Styx
    </Button>
  </div>
);
