import React from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Check,
  Linkedin,
} from "lucide-react";
import type { Candidate, TraitEvaluation } from "@/types";

interface CandidateSidebarProps {
  candidate: Candidate;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const TraitEvaluationItem: React.FC<{ evaluation: TraitEvaluation }> = ({
  evaluation,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="font-medium text-gray-900">{evaluation.section}</h4>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${
              evaluation.value === true
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {evaluation.value === true ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </span>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>
      {isOpen && (
        <div className="text-sm text-gray-600 mt-3 pl-2 border-l-2 border-gray-100">
          {evaluation.content}
        </div>
      )}
    </div>
  );
};

export const CandidateSidebar: React.FC<CandidateSidebarProps> = ({
  candidate,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && onPrevious && hasPrevious) {
        onPrevious();
      } else if (e.key === "ArrowRight" && onNext && hasNext) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPrevious, onNext, hasPrevious, hasNext]);

  if (!candidate) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-xl border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-200">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            {onPrevious && (
              <button
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {candidate.name || "Unknown Candidate"}
            </h2>
            {onNext && (
              <button
                onClick={onNext}
                disabled={!hasNext}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {candidate.profile?.occupation && (
          <div className="px-6 pb-6">
            <p className="text-gray-600">{candidate.profile.occupation}</p>
          </div>
        )}
      </div>

      <div className="p-6 space-y-8">
        {candidate.url && (
          <a
            href={candidate.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 bg-purple-50 px-4 py-2 rounded-lg transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn Profile</span>
          </a>
        )}

        {candidate.summary && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Summary
            </h3>
            <p className="text-gray-600 leading-relaxed">{candidate.summary}</p>
          </div>
        )}

        {candidate.sections && candidate.sections.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Trait Evaluation
            </h3>
            <div className="space-y-4">
              {candidate.sections.map((section, index) => (
                <TraitEvaluationItem key={index} evaluation={section} />
              ))}
            </div>
          </div>
        )}

        {candidate.profile?.experiences && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Experience
            </h3>
            <div className="space-y-4">
              {candidate.profile.experiences.map((experience, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 hover:border-purple-200 rounded-lg transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {experience.title}
                      </h4>
                      <p className="text-purple-600">{experience.company}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {experience.starts_at && experience.ends_at ? (
                        <p>
                          {experience.starts_at} - {experience.ends_at}
                        </p>
                      ) : experience.starts_at ? (
                        <p>{experience.starts_at} - Present</p>
                      ) : null}
                    </div>
                  </div>
                  {experience.description && (
                    <p className="mt-3 text-gray-600 text-sm">
                      {experience.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {candidate.profile?.education && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Education
            </h3>
            <div className="space-y-4">
              {candidate.profile.education.map((education, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 hover:border-purple-200 rounded-lg transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {education.degree_name}
                      </h4>
                      <p className="text-purple-600">{education.school}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {education.starts_at && education.ends_at ? (
                        <p>
                          {education.starts_at} - {education.ends_at}
                        </p>
                      ) : education.starts_at ? (
                        <p>{education.starts_at} - Present</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
