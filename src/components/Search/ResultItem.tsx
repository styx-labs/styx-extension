import React from "react";
import { Star, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import type { EvaluationSection } from "@/types";

interface ResultItemProps {
  section: EvaluationSection;
  isOpen: boolean;
  onToggle: () => void;
  processContent: (content: string) => string;
}

const ResultItem: React.FC<ResultItemProps> = ({
  section,
  isOpen,
  onToggle,
  processContent,
}) => (
  <div className="result-card rounded-xl p-5">
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 ${isOpen ? "mb-4" : ""}`}
    >
      {section.score >= 8 ? (
        <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0" />
      ) : section.score > 5 ? (
        <Star className="w-5 h-5 text-purple-400 flex-shrink-0" />
      ) : null}
      <h3 className="text-gray-900 font-semibold text-xl text-left flex-grow">
        {section.section.charAt(0).toUpperCase() + section.section.slice(1)}
      </h3>
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
            style={{ width: `${(section.score / 10) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-500 w-12">
          {Math.round(section.score)}/10
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </button>
    {isOpen && (
      <div
        className="prose max-w-none text-gray-600 pt-2 border-t border-gray-100 text-base"
        dangerouslySetInnerHTML={{ __html: processContent(section.content) }}
      />
    )}
  </div>
);

export default ResultItem;
