import React, { useState } from "react";
import type { EvaluationResponse, Citation } from "@/types";
import ResultItem from "./ResultItem";
import SourceItem from "./SourceItem";
import Section from "./Section";
import ResultSkeleton from "./ResultSkeleton";
import SourceSkeleton from "./SourceSkeleton";

interface EvaluationResultsProps {
  evaluation: EvaluationResponse;
  loading?: boolean;
}

const EvaluationResults: React.FC<EvaluationResultsProps> = ({
  evaluation,
  loading = false,
}) => {
  const [openSections, setOpenSections] = useState<number[]>([0]);

  const citationsMap = evaluation.citations.reduce((acc, citation, index) => {
    acc[index + 1] = citation;
    return acc;
  }, {} as Record<number, Citation>);

  const processContent = (content: string) => {
    return content.replace(/\[(\d+)\]\(([^)]+)\)/g, (_, num, url) => {
      const citation = citationsMap[parseInt(num)];
      if (!citation) return `[[${num}]]`;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:text-purple-700">[${num}]</a>`;
    });
  };

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <ResultSkeleton key={i} />
          ))}
        </div>
        <Section title="Sources" className="border-t border-gray-100 pt-6">
          <div className="grid gap-2 w-full">
            {[...Array(2)].map((_, i) => (
              <SourceSkeleton key={i} />
            ))}
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {evaluation.sections.map((section, index) => (
          <ResultItem
            key={index}
            section={section}
            isOpen={openSections.includes(index)}
            onToggle={() => toggleSection(index)}
            processContent={processContent}
          />
        ))}
      </div>

      <Section title="Sources" className="border-t border-gray-100 pt-6">
        <div className="grid gap-2 w-full">
          {evaluation.citations.map((citation) => (
            <SourceItem key={citation.index} citation={citation} />
          ))}
        </div>
      </Section>
    </div>
  );
};

export default EvaluationResults;
