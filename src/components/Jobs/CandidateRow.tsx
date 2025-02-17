import React from "react";
import type { Candidate } from "@/types";
import { Badge } from "@/components/ui/badge";

interface CandidateRowProps {
  candidate: Candidate;
  onClick: () => void;
}

export const CandidateRow: React.FC<CandidateRowProps> = ({
  candidate,
  onClick,
}) => {
  const getFitLabel = (
    fit: number | undefined
  ): { label: string; variant: "default" | "secondary" | "outline" } => {
    if (fit === undefined) return { label: "N/A", variant: "outline" };
    if (fit === 4) return { label: "Ideal", variant: "default" };
    if (fit === 3) return { label: "Good", variant: "secondary" };
    if (fit === 2) return { label: "Potential", variant: "outline" };
    return { label: "Bad", variant: "outline" };
  };

  // Calculate total required and optional traits
  const totalRequired =
    candidate.sections?.filter((section) => section.required).length || 0;
  const totalOptional =
    candidate.sections?.filter((section) => !section.required).length || 0;

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
    >
      <td className="px-4 py-4 whitespace-nowrap max-w-[200px]">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900 truncate">
            {candidate.name}
          </div>
          {candidate.profile?.occupation && (
            <div className="text-xs text-gray-500 truncate">
              {candidate.profile.occupation}
            </div>
          )}
        </div>
      </td>
      <td className="px-2 py-4 whitespace-nowrap max-w-[60px] text-center">
        {candidate.sections && (
          <Badge
            variant={getFitLabel(candidate.fit).variant}
            className={cn(
              "font-medium hover:bg-inherit",
              candidate.fit && candidate.fit >= 4
                ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                : candidate.fit && candidate.fit >= 3
                ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"
                : candidate.fit && candidate.fit >= 2
                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
            )}
          >
            {getFitLabel(candidate.fit).label}
          </Badge>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center min-w-[100px]">
        <div className="flex flex-col items-center gap-2 text-xs">
          <span
            className={`flex items-center gap-2 ${
              candidate.required_met === totalRequired
                ? "text-green-600"
                : "text-gray-600"
            }`}
          >
            <span className="font-medium">Required:</span>
            {candidate.required_met || 0}/{totalRequired}
          </span>
          <span className="flex items-center gap-2 text-gray-600">
            <span className="font-medium">Optional:</span>
            {candidate.optional_met || 0}/{totalOptional}
          </span>
        </div>
      </td>
    </tr>
  );
};
