import React from "react";
import { ExternalLink } from "lucide-react";
import Skeleton from "./Skeleton";

const SourceSkeleton: React.FC = () => (
  <div className="result-card rounded-xl p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-3 flex-grow min-w-0">
        <ExternalLink className="w-5 h-5 text-gray-200 flex-shrink-0" />
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full" />
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-16 h-2 bg-gray-100 rounded-full" />
        <Skeleton className="w-16 h-5" />
      </div>
    </div>
  </div>
);

export default SourceSkeleton;
