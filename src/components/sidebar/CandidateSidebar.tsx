import React from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Check,
  Linkedin,
  BriefcaseIcon,
  GraduationCap,
  TrendingUp,
  Building2,
  Timer,
  Code2,
  Tags,
  LinkedinIcon,
  Mail,
  MessageSquarePlus,
  Loader2,
  Trash2,
  Link,
} from "lucide-react";
import type { Candidate, TraitEvaluation } from "@/types";
import {
  getEmail,
  getCandidateReachout,
  deleteCandidate,
} from "@/utils/apiUtils";
import toast from "react-hot-toast";

// Date formatting utilities
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const calculateTenure = (startDate: string, endDate?: string | null) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} mo${remainingMonths !== 1 ? "s" : ""}`;
  } else if (remainingMonths === 0) {
    return `${years} yr${years !== 1 ? "s" : ""}`;
  }
  return `${years} yr${years !== 1 ? "s" : ""} ${remainingMonths} mo${
    remainingMonths !== 1 ? "s" : ""
  }`;
};

interface CandidateSidebarProps {
  candidate: Candidate;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  loadingStates: { [key: string]: { email: boolean; message: boolean } };
  handleDelete: (e: React.MouseEvent, id: string) => Promise<void>;
  jobId?: string;
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
        <h4 className="text-lg font-medium text-gray-900">
          {evaluation.section}
        </h4>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-base font-medium ${
              evaluation.value === true
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {evaluation.value === true ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </span>
          <ChevronRight
            className={`w-5 h-5 transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>
      {isOpen && (
        <div className="text-base text-gray-600 mt-3 pl-3 border-l-2 border-gray-200">
          {evaluation.content}
        </div>
      )}
    </div>
  );
};

const formatFundingStages = (stages?: string[]) => {
  if (!stages) return null;
  const validStages = [
    ...new Set(stages.filter((stage) => stage !== "Unknown")),
  ];
  if (validStages.length === 0) return null;
  if (validStages.length === 1 && validStages[0] === "IPO") return null;
  if (validStages.length === 1) return `Worked during ${validStages[0]}`;
  const firstStage = validStages[0];
  const lastStage = validStages[validStages.length - 1];
  return firstStage === lastStage
    ? `Worked during ${firstStage}`
    : `Worked during ${firstStage} to ${lastStage}`;
};

// Helper function to get career tag color
const getCareerTagStyle = (tag: string): string => {
  switch (tag) {
    // Career Progression Tags
    case "High Average Tenure":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Low Average Tenure":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Single Promotion":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Multiple Promotions":
      return "bg-green-50 text-green-700 border-green-200";
    case "Diverse Company Experience":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "Single Company Focus":
      return "bg-teal-50 text-teal-700 border-teal-200";

    // Company Type Tags
    case "Worked at Big Tech":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "Worked at Unicorn":
      return "bg-pink-50 text-pink-700 border-pink-200";
    case "Worked at Quant Fund":
      return "bg-purple-50 text-purple-700 border-purple-200";

    // Company Stage Tags
    case "Startup Experience":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Growth Company Experience":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "Public Company Experience":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const CandidateSidebar: React.FC<CandidateSidebarProps> = ({
  candidate,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  loadingStates,
  jobId,
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

  const handleEmailClick = async () => {
    if (!candidate.url || !candidate.id) return;

    try {
      const response = await getEmail(candidate.url);
      if (response?.data?.email) {
        await navigator.clipboard.writeText(response.data.email);
        toast.success("Email copied to clipboard!", {
          style: {
            background: "#10B981",
            color: "#FFFFFF",
            padding: "16px",
          },
          iconTheme: {
            primary: "#FFFFFF",
            secondary: "#10B981",
          },
        });
      }
    } catch (error) {
      console.error("Error getting email:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to fetch email address",
        {
          style: {
            background: "#EF4444",
            color: "#FFFFFF",
            padding: "16px",
          },
          iconTheme: {
            primary: "#FFFFFF",
            secondary: "#EF4444",
          },
        }
      );
    }
  };

  const handleReachoutClick = async () => {
    if (!candidate.id || !jobId) return;

    try {
      const response = await getCandidateReachout(
        jobId,
        candidate.id,
        "linkedin"
      );
      if (response?.data?.reachout) {
        await navigator.clipboard.writeText(response.data.reachout);
        toast.success("LinkedIn message copied to clipboard!", {
          style: {
            background: "#10B981",
            color: "#FFFFFF",
            padding: "16px",
          },
          iconTheme: {
            primary: "#FFFFFF",
            secondary: "#10B981",
          },
        });
      }
    } catch (error) {
      console.error("Error getting reachout:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to generate LinkedIn message",
        {
          style: {
            background: "#EF4444",
            color: "#FFFFFF",
            padding: "16px",
          },
          iconTheme: {
            primary: "#FFFFFF",
            secondary: "#EF4444",
          },
        }
      );
    }
  };

  const handleDelete = async () => {
    if (!candidate.id || !jobId) return;
    try {
      await deleteCandidate(jobId, candidate.id);
      console.log("Candidate deleted successfully");
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
  };

  if (!candidate) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[600px] bg-white shadow-xl border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-200">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            {onPrevious && (
              <button
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <h2 className="text-2xl font-semibold text-gray-900">
              {candidate.name || "Unknown Candidate"}
            </h2>
            {onNext && (
              <button
                onClick={onNext}
                disabled={!hasNext}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <button
                disabled={!candidate.url}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50"
                onClick={() =>
                  candidate.url && window.open(candidate.url, "_blank")
                }
              >
                <LinkedinIcon className="h-5 w-5 text-[#0A66C2]" />
              </button>
              <button
                disabled={!candidate.url || !candidate.id}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50"
                onClick={handleEmailClick}
              >
                {loadingStates &&
                candidate.id &&
                loadingStates[candidate.id]?.email ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
              </button>
              <div className="relative inline-block">
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50"
                  onClick={handleReachoutClick}
                >
                  {loadingStates &&
                  candidate.id &&
                  loadingStates[candidate.id]?.message ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="h-5 w-5" />
                  )}
                </button>
              </div>
              <button
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all"
                onClick={handleDelete}
                disabled={!candidate.id}
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        {candidate.profile?.occupation && (
          <div className="px-6 pb-6">
            <p className="text-lg text-gray-600">
              {candidate.profile.occupation}
            </p>
          </div>
        )}
      </div>

      <div className="p-6 space-y-8">
        {(candidate.summary || candidate.evaluation?.score !== undefined) && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-gray-900">Summary</h3>
              {candidate.evaluation?.score !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-base text-gray-600">Fit Score:</span>
                  <span
                    className={`text-lg font-semibold px-3 py-1 rounded-full ${
                      candidate.evaluation.score >= 0.8
                        ? "bg-green-50 text-green-700"
                        : candidate.evaluation.score >= 0.6
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {Math.round(candidate.evaluation.score * 100)}%
                  </span>
                </div>
              )}
            </div>
            {candidate.summary && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {candidate.summary}
              </p>
            )}
          </div>
        )}

        {candidate.profile?.career_metrics && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Career Metrics
            </h3>
            <div className="p-5 border border-gray-200 rounded-lg">
              <div className="space-y-6">
                {/* Career Tags */}
                {candidate.profile.career_metrics.career_tags &&
                  candidate.profile.career_metrics.career_tags.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-base text-gray-800">
                        <Tags className="h-5 w-5" />
                        <span>Career Insights</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {candidate.profile.career_metrics.career_tags.map(
                          (tag, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1.5 rounded-full text-base ${getCareerTagStyle(
                                tag
                              )}`}
                            >
                              {tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {candidate.profile.career_metrics.experience_tags &&
                  candidate.profile.career_metrics.experience_tags.length >
                    0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-base text-gray-800">
                        <Tags className="h-5 w-5" />
                        <span>Experience Insights</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {candidate.profile.career_metrics.experience_tags.map(
                          (tag, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1.5 rounded-full text-base ${getCareerTagStyle(
                                tag
                              )}`}
                            >
                              {tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-base text-gray-800">
                      <Timer className="h-5 w-5" />
                      <span>Total Experience</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">
                      {calculateTenure(
                        new Date(
                          Date.now() -
                            (candidate.profile.career_metrics
                              .total_experience_months || 0) *
                              30 *
                              24 *
                              60 *
                              60 *
                              1000
                        ).toISOString(),
                        new Date().toISOString()
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-base text-gray-800">
                      <Building2 className="h-5 w-5" />
                      <span>Avg. Tenure</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">
                      {calculateTenure(
                        new Date(
                          Date.now() -
                            (candidate.profile.career_metrics
                              .average_tenure_months || 0) *
                              30 *
                              24 *
                              60 *
                              60 *
                              1000
                        ).toISOString(),
                        new Date().toISOString()
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-base text-gray-800">
                      <Timer className="h-5 w-5" />
                      <span>Current Tenure</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">
                      {calculateTenure(
                        new Date(
                          Date.now() -
                            (candidate.profile.career_metrics
                              .current_tenure_months || 0) *
                              30 *
                              24 *
                              60 *
                              60 *
                              1000
                        ).toISOString(),
                        new Date().toISOString()
                      )}
                    </p>
                  </div>
                </div>

                {/* Tech Stacks */}
                {candidate.profile.career_metrics.tech_stacks &&
                  candidate.profile.career_metrics.tech_stacks.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-base text-gray-800">
                        <Code2 className="h-5 w-5" />
                        <span>Tech Stacks</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {candidate.profile.career_metrics.tech_stacks.map(
                          (stack, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-base"
                            >
                              {stack}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {candidate.sections && candidate.sections.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5" />
              Experience
            </h3>
            <div className="space-y-4">
              {candidate.profile.experiences.map((experience, index) => (
                <div
                  key={index}
                  className="p-5 border border-gray-200 hover:border-gray-300 rounded-lg transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {experience.title}
                      </h4>
                      {experience.company_linkedin_profile_url ? (
                        <a
                          href={experience.company_linkedin_profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                        >
                          {experience.company}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <p className="text-base text-gray-700">
                          {experience.company}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-base text-gray-600">
                          {formatDate(experience.starts_at)} -{" "}
                          {experience.ends_at
                            ? formatDate(experience.ends_at)
                            : "Present"}
                        </p>
                        <span className="text-base bg-gray-100 text-gray-700 px-3 py-1 rounded-full ml-3">
                          {calculateTenure(
                            experience.starts_at,
                            experience.ends_at
                          )}
                        </span>
                      </div>
                    </div>
                    {experience.funding_stages_during_tenure &&
                      formatFundingStages(
                        experience.funding_stages_during_tenure
                      ) && (
                        <span className="text-base bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                          {formatFundingStages(
                            experience.funding_stages_during_tenure
                          )}
                        </span>
                      )}
                  </div>
                  {experience.description && (
                    <div className="space-y-4 pt-3 border-t border-gray-200 mt-4">
                      <p className="text-base text-gray-600">
                        {experience.description}
                      </p>
                      {experience.summarized_job_description && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-lg font-medium text-gray-900 mb-4">
                            Generated Job Description
                          </p>
                          <div className="space-y-5">
                            <div>
                              <h4 className="font-medium text-base text-gray-800 mb-2">
                                Role Summary:
                              </h4>
                              <p className="text-base text-gray-600">
                                {
                                  experience.summarized_job_description
                                    .role_summary
                                }
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium text-base text-gray-800 mb-2">
                                Skills:
                              </h4>
                              <ul className="list-disc list-inside text-base text-gray-600 space-y-1.5 ml-2">
                                {experience.summarized_job_description.skills?.map(
                                  (skill, idx) => (
                                    <li key={idx}>{skill}</li>
                                  )
                                )}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium text-base text-gray-800 mb-2">
                                Requirements:
                              </h4>
                              <ul className="list-disc list-inside text-base text-gray-600 space-y-1.5 ml-2">
                                {experience.summarized_job_description.requirements?.map(
                                  (req, idx) => (
                                    <li key={idx}>{req}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                          {experience.summarized_job_description.sources
                            .length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <p className="text-base text-gray-700 mb-2">
                                Sources:
                              </p>
                              <div className="space-y-1.5">
                                {experience.summarized_job_description.sources.map(
                                  (source, idx) => (
                                    <a
                                      key={idx}
                                      href={source}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-base text-blue-600 hover:text-blue-800 hover:underline truncate"
                                    >
                                      {source}
                                    </a>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {candidate.profile?.education &&
          candidate.profile.education.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </h3>
              <div className="space-y-4">
                {candidate.profile.education.map((edu, index) => (
                  <div
                    key={index}
                    className="p-5 border border-gray-200 hover:border-gray-300 rounded-lg transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-medium text-gray-900">
                        {edu.school}
                      </p>
                      {edu.university_tier &&
                        edu.university_tier !== "other" && (
                          <span className="text-base bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                            {edu.university_tier
                              .replace("_", " ")
                              .toUpperCase()}
                          </span>
                        )}
                    </div>
                    <p className="text-base text-gray-700 mt-1">
                      {edu.degree_name && edu.field_of_study
                        ? `${edu.degree_name} in ${edu.field_of_study}`
                        : edu.degree_name || edu.field_of_study}
                    </p>
                    {edu.starts_at && edu.ends_at && (
                      <p className="text-base text-gray-600 mt-1">
                        {formatDate(edu.starts_at)} - {formatDate(edu.ends_at)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {candidate.citations && candidate.citations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Link className="w-5 h-5" />
              Sources
            </h3>
            <div className="space-y-4">
              {candidate.citations.map((citation, index) => (
                <div
                  key={index}
                  className="p-5 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                    >
                      {new URL(citation.url).hostname}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <span className="text-base text-gray-600">
                      Confidence: {Math.round(citation.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-base text-gray-600">
                    {citation.distilled_content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
