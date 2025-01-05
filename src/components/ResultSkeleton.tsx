import React from "react";
import { Star } from "lucide-react";
import Skeleton from "./Skeleton";

const ResultSkeleton: React.FC = () => (
  <div className="result-card rounded-xl p-5">
    <div className="flex items-center gap-3 mb-4">
      <Star className="w-5 h-5 text-gray-200 flex-shrink-0" />
      <Skeleton className="h-7 w-32" />
      <div className="flex items-center gap-2 ml-auto">
        <div className="w-16 h-2 bg-gray-100 rounded-full" />
        <Skeleton className="w-12 h-5" />
      </div>
    </div>
  </div>
);

export default ResultSkeleton;
