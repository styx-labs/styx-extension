import React from "react";
import type { Candidate } from "@/types";

interface CandidateRowProps {
  candidate: Candidate;
  onClick: () => void;
}

export const CandidateRow: React.FC<CandidateRowProps> = ({
  candidate,
  onClick,
}) => {
  const getFitScoreLabel = (fit: number | undefined) => {
    if (fit === undefined) return { label: "N/A" };
    if (fit === 4) return { label: "Ideal" };
    if (fit === 3) return { label: "Good" };
    if (fit === 2) return { label: "Potential" };
    if (fit === 1) return { label: "Likely Not" };
    return { label: "Not" };
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
      <td className="px-6 py-4 whitespace-nowrap max-w-[200px]">
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
      <td className="px-6 py-4 whitespace-nowrap text-center max-w-[60px] min-w-[60px]">
        {candidate.sections && (
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              candidate.fit === 4
                ? "bg-green-100 text-green-700"
                : candidate.fit === 3
                ? "bg-blue-100 text-blue-700"
                : candidate.fit === 2
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {getFitScoreLabel(candidate.fit).label}
          </span>
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
