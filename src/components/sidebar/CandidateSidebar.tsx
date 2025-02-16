import React, { useState, useEffect, useRef } from "react";
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
  UserPlus,
  Star,
  ChevronDown,
} from "lucide-react";
import type { Candidate, TraitEvaluation, ProfileExperience } from "@/types";
import { getEmail, getCandidateReachout } from "@/utils/apiUtils";
import toast from "react-hot-toast";
import { connectAndMessage } from "@/utils/linkedinUtils";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";

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

interface GroupedExperience {
  company: string;
  company_linkedin_profile_url?: string;
  roles: Array<ProfileExperience>;
  overall_start: string;
  overall_end?: string;
  funding_stages_during_tenure?: string[];
}

const groupExperiences = (
  experiences: ProfileExperience[]
): GroupedExperience[] => {
  const sortedExperiences = [...experiences].sort(
    (a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
  );

  const grouped: GroupedExperience[] = [];
  let currentGroup: GroupedExperience | null = null;

  sortedExperiences.forEach((exp) => {
    if (!currentGroup || currentGroup.company !== exp.company) {
      if (currentGroup) {
        grouped.push(currentGroup);
      }
      currentGroup = {
        company: exp.company,
        company_linkedin_profile_url: exp.company_linkedin_profile_url,
        roles: [exp],
        overall_start: exp.starts_at,
        overall_end: exp.ends_at,
        funding_stages_during_tenure: exp.funding_stages_during_tenure,
      };
    } else {
      currentGroup.roles.push(exp);
      // Update overall dates
      if (new Date(exp.starts_at) < new Date(currentGroup.overall_start)) {
        currentGroup.overall_start = exp.starts_at;
      }
      if (
        !currentGroup.overall_end ||
        (exp.ends_at &&
          new Date(exp.ends_at) > new Date(currentGroup.overall_end))
      ) {
        currentGroup.overall_end = exp.ends_at;
      }
      // Merge funding stages
      if (exp.funding_stages_during_tenure) {
        currentGroup.funding_stages_during_tenure = [
          ...new Set([
            ...(currentGroup.funding_stages_during_tenure || []),
            ...exp.funding_stages_during_tenure,
          ]),
        ];
      }
    }
  });

  if (currentGroup) {
    grouped.push(currentGroup);
  }

  return grouped;
};

const TraitEvaluationItem: React.FC<{ evaluation: TraitEvaluation }> = ({
  evaluation,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "px-2 py-1 rounded-md text-lg font-medium flex items-center gap-1.5",
              evaluation.value === true
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200",
              evaluation.required ? "shadow-sm" : "opacity-75"
            )}
          >
            {evaluation.value === true ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span className="flex items-center gap-1">
              {evaluation.section}
              {evaluation.required ? (
                <Star className="h-3 w-3 fill-current opacity-75" />
              ) : null}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="px-4 py-3 mt-1.5 text-lg text-muted-foreground bg-muted/50 rounded-md border border-muted">
          {evaluation.content}
        </div>
      </CollapsibleContent>
    </Collapsible>
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
  const firstStage = validStages[validStages.length - 1];
  const lastStage = validStages[0];
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

// Helper functions for trait calculations
const getRequiredTraitsMet = (candidate: Candidate): number => {
  return (
    candidate.sections?.filter((section) => section.required && section.value)
      .length || 0
  );
};

const getOptionalTraitsMet = (candidate: Candidate): number => {
  return (
    candidate.sections?.filter((section) => !section.required && section.value)
      .length || 0
  );
};

const getTotalRequiredTraits = (candidate: Candidate): number => {
  return candidate.sections?.filter((section) => section.required).length || 0;
};

const getTotalOptionalTraits = (candidate: Candidate): number => {
  return candidate.sections?.filter((section) => !section.required).length || 0;
};

const getFitLabel = (
  fit: number | undefined
): { label: string; variant: "default" | "secondary" | "outline" } => {
  if (fit === undefined) return { label: "N/A", variant: "outline" };
  if (fit >= 4) return { label: "Ideal Fit", variant: "default" };
  if (fit >= 3) return { label: "Good Fit", variant: "secondary" };
  if (fit >= 2) return { label: "Potential Fit", variant: "outline" };
  return { label: "Not a Fit", variant: "outline" };
};

export const CandidateSidebar: React.FC<CandidateSidebarProps> = ({
  candidate,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  loadingStates,
  handleDelete,
  jobId,
}) => {
  const citationRefs = useRef<{ [key: number]: HTMLDivElement }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && onPrevious && hasPrevious) {
        onPrevious();
      } else if (e.key === "ArrowRight" && onNext && hasNext) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPrevious, onNext, hasPrevious, hasNext, onClose]);

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

  const handleConnectClick = async () => {
    if (!candidate.url || !jobId || !candidate.id) return;
    try {
      const response = await getCandidateReachout(
        jobId,
        candidate.id,
        "linkedin"
      );
      await connectAndMessage(candidate.url, response?.data?.reachout);
      toast.success("Connection request sent!", {
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
    } catch (error) {
      console.error("Error connecting to candidate:", error);
      toast.error("Failed to send connection request", {
        style: {
          background: "#EF4444",
          color: "#FFFFFF",
          padding: "16px",
        },
        iconTheme: {
          primary: "#FFFFFF",
          secondary: "#EF4444",
        },
      });
    }
  };

  if (!candidate) return null;

  return (
    <motion.div
      className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-xl border-l border-gray-200 z-[9999] flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className="flex items-center justify-between p-4 border-b border-gray-200 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-4">
          <motion.div className="flex items-center gap-2">
            <motion.button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 relative group/tooltip"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-5 w-5" />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-base rounded-md whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none z-50">
                Previous candidate
              </div>
            </motion.button>
            <motion.button
              onClick={onNext}
              disabled={!hasNext}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 relative group/tooltip"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-5 w-5" />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-base rounded-md whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none z-50">
                Next candidate
              </div>
            </motion.button>
          </motion.div>
          <motion.h2
            className="text-xl font-semibold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {candidate.name}
          </motion.h2>
        </div>
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mr-4">
            <motion.button
              disabled={!candidate.url}
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 relative group/tooltip"
              onClick={() =>
                candidate.url && window.open(candidate.url, "_blank")
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LinkedinIcon className="h-6 w-6 text-[#0A66C2]" />
              <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-900 text-white text-base rounded-md whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none z-50">
                View LinkedIn Profile
              </div>
            </motion.button>
            <motion.button
              disabled={!candidate.url}
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 relative group/tooltip"
              onClick={handleConnectClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus className="h-6 w-6" />
              <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-900 text-white text-base rounded-md whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none z-50">
                Send LinkedIn Connection Request
              </div>
            </motion.button>
            <motion.button
              disabled={!candidate.url || !candidate.id}
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 relative group/tooltip"
              onClick={handleEmailClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loadingStates &&
              candidate.id &&
              loadingStates[candidate.id]?.email ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-6 w-6" />
                </motion.div>
              ) : (
                <Mail className="h-6 w-6" />
              )}
              <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-900 text-white text-base rounded-md whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none z-50">
                Get Email Address
              </div>
            </motion.button>
            <div className="relative inline-block">
              <motion.button
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50 relative group/tooltip"
                onClick={handleReachoutClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loadingStates &&
                candidate.id &&
                loadingStates[candidate.id]?.message ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <MessageSquarePlus className="h-6 w-6" />
                )}
                <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-900 text-white text-base rounded-md whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none z-50">
                  Generate LinkedIn Message
                </div>
              </motion.button>
            </div>
            <button
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all relative group/tooltip"
              onClick={(e) => handleDelete(e, candidate.id)}
              disabled={!candidate.id}
            >
              <Trash2 className="h-6 w-6 text-red-500" />
              <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-900 text-white text-base rounded-md whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none z-50">
                Remove Candidate
              </div>
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all relative group/tooltip"
          >
            <X className="w-6 h-6" />
            <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-900 text-white text-base rounded-md whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none z-50">
              Close Sidebar
            </div>
          </button>
        </motion.div>
      </motion.div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Trait Evaluation Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium text-purple-900">
                Trait Match
              </h3>
              <div className="flex items-center gap-2">
                {getTotalRequiredTraits(candidate) > 0 && (
                  <Badge
                    variant={
                      getRequiredTraitsMet(candidate) ===
                      getTotalRequiredTraits(candidate)
                        ? "secondary"
                        : "outline"
                    }
                    className={cn(
                      "bg-purple-100 hover:bg-purple-100 text-lg",
                      getRequiredTraitsMet(candidate) ===
                        getTotalRequiredTraits(candidate)
                        ? "text-purple-700 border-purple-200"
                        : "text-purple-600 border-purple-200"
                    )}
                  >
                    {getRequiredTraitsMet(candidate)}/
                    {getTotalRequiredTraits(candidate)} Required
                  </Badge>
                )}
                {getTotalOptionalTraits(candidate) > 0 && (
                  <Badge
                    variant="outline"
                    className="text-purple-600 border-purple-200 text-lg"
                  >
                    {getOptionalTraitsMet(candidate)}/
                    {getTotalOptionalTraits(candidate)} Optional
                  </Badge>
                )}
              </div>
            </div>
            <Card className="border-purple-100/50">
              <div className="p-4 space-y-3">
                {candidate.sections?.map((section, index) => (
                  <TraitEvaluationItem key={index} evaluation={section} />
                ))}
              </div>
            </Card>
          </div>

          {/* Summary Section */}
          {(candidate.summary || candidate.sections) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-purple-900">
                  Summary
                </h3>
                {candidate.sections && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getFitLabel(candidate.fit).variant}
                      className={cn(
                        "font-medium hover:bg-inherit text-lg",
                        candidate.fit && candidate.fit >= 0.8
                          ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                          : candidate.fit && candidate.fit >= 0.6
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"
                          : candidate.fit && candidate.fit >= 0.4
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                          : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                      )}
                    >
                      {getFitLabel(candidate.fit).label}
                    </Badge>
                  </div>
                )}
              </div>
              {candidate.summary && (
                <Card className="text-card-foreground shadow border-purple-100/50">
                  <div className="p-4">
                    <p className="text-lg leading-relaxed">
                      {candidate.summary}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {candidate.profile?.career_metrics && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Career Metrics
              </h3>
              <div className="p-5 border bg-card text-card-foreground shadow border-purple-100/50 rounded-lg">
                <div className="space-y-6">
                  {/* Career Tags */}
                  {candidate.profile.career_metrics.career_tags &&
                    candidate.profile.career_metrics.career_tags.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-lg text-purple-800">
                          <Tags className="h-5 w-5" />
                          <span>Career Insights</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {candidate.profile.career_metrics.career_tags.map(
                            (tag, index) => (
                              <span
                                key={index}
                                className={`px-3 py-1.5 rounded-full text-lg font-medium ${getCareerTagStyle(
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
                        <div className="flex items-center gap-2 text-lg text-purple-800">
                          <Tags className="h-5 w-5" />
                          <span>Experience Insights</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {candidate.profile.career_metrics.experience_tags.map(
                            (tag, index) => (
                              <span
                                key={index}
                                className={`px-3 py-1.5 rounded-full text-lg font-medium ${getCareerTagStyle(
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
                      <div className="flex items-center gap-2 text-lg text-purple-800">
                        <Timer className="h-5 w-5" />
                        <span>Total Experience</span>
                      </div>
                      <p className="text-xl font-semibold text-purple-900">
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
                      <div className="flex items-center gap-2 text-lg text-purple-800">
                        <Building2 className="h-5 w-5" />
                        <span>Avg. Tenure</span>
                      </div>
                      <p className="text-xl font-semibold text-purple-900">
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
                      <div className="flex items-center gap-2 text-lg text-purple-800">
                        <Timer className="h-5 w-5" />
                        <span>Current Tenure</span>
                      </div>
                      <p className="text-xl font-semibold text-purple-900">
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
                      <div className="space-y-3 pt-4 border-t border-purple-200">
                        <div className="flex items-center gap-2 text-base text-purple-800">
                          <Code2 className="h-5 w-5" />
                          <span>Tech Stacks</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {candidate.profile.career_metrics.tech_stacks.map(
                            (stack, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-base"
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

          {candidate.profile?.experiences && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-purple-800/90 flex items-center gap-2">
                <BriefcaseIcon className="h-4 w-4" />
                Experience
              </h4>
              <div className="space-y-4">
                {groupExperiences(candidate.profile.experiences).map(
                  (exp, index) => (
                    <Card key={index} className="border-purple-100/50">
                      <div className="p-4 space-y-3">
                        {exp.roles.length === 1 ? (
                          // Single role experience
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-xl text-purple-900">
                                {exp.roles[0].title}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-lg text-purple-600 border-purple-200"
                              >
                                {calculateTenure(
                                  exp.roles[0].starts_at,
                                  exp.roles[0].ends_at || null
                                )}
                              </Badge>
                            </div>
                            {exp.company_linkedin_profile_url ? (
                              <a
                                href={exp.company_linkedin_profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lg text-purple-700/90 hover:text-purple-900 hover:underline inline-flex items-center gap-1"
                              >
                                {exp.company}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <p className="text-lg text-purple-700/90">
                                {exp.company}
                              </p>
                            )}
                            <p className="text-base text-purple-600/75">
                              {formatDate(exp.roles[0].starts_at)} -{" "}
                              {exp.roles[0].ends_at
                                ? formatDate(exp.roles[0].ends_at)
                                : "Present"}
                            </p>
                            {exp.funding_stages_during_tenure &&
                              formatFundingStages(
                                exp.funding_stages_during_tenure
                              ) && (
                                <Badge
                                  variant="secondary"
                                  className="text-base bg-emerald-50 text-emerald-700 border-emerald-200 mt-1"
                                >
                                  {formatFundingStages(
                                    exp.funding_stages_during_tenure
                                  )}
                                </Badge>
                              )}
                            {exp.roles[0].description && (
                              <div className="space-y-3 pt-2 border-t border-purple-100/50">
                                <p className="text-lg text-muted-foreground">
                                  {exp.roles[0].description}
                                </p>
                              </div>
                            )}
                            {exp.roles[0].summarized_job_description && (
                              <div className="mt-3 p-3 bg-purple-50 rounded-md">
                                <p className="text-xl text-gray-700 font-medium">
                                  Generated Job Description
                                </p>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium text-lg">
                                      Role Summary:
                                    </h4>
                                    <p className="text-gray-600 text-base">
                                      {
                                        exp.roles[0].summarized_job_description
                                          .role_summary
                                      }
                                    </p>
                                  </div>

                                  {exp.roles[0].summarized_job_description
                                    .skills && (
                                    <div>
                                      <h4 className="font-medium text-lg">
                                        Skills:
                                      </h4>
                                      <ul className="list-disc list-inside text-gray-600 text-base pl-2 space-y-1">
                                        {exp.roles[0].summarized_job_description.skills.map(
                                          (skill: string, idx: number) => (
                                            <li key={idx}>{skill}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                  {exp.roles[0].summarized_job_description
                                    .requirements && (
                                    <div>
                                      <h4 className="font-medium text-lg">
                                        Requirements:
                                      </h4>
                                      <ul className="list-disc list-inside text-gray-600 text-base pl-2 space-y-1">
                                        {exp.roles[0].summarized_job_description.requirements.map(
                                          (req: string, idx: number) => (
                                            <li key={idx}>{req}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                {exp.roles[0].summarized_job_description
                                  .sources &&
                                  exp.roles[0].summarized_job_description
                                    .sources.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-purple-100">
                                      <p className="text-lg text-gray-500">
                                        Sources:
                                      </p>
                                      <div className="mt-1 space-y-1">
                                        {exp.roles[0].summarized_job_description.sources.map(
                                          (source: string, idx: number) => (
                                            <a
                                              key={idx}
                                              href={source}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="block text-base text-purple-600 hover:text-purple-800 hover:underline truncate text-nowrap w-full"
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
                        ) : (
                          // Multiple roles experience
                          <>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  {exp.company_linkedin_profile_url ? (
                                    <a
                                      href={exp.company_linkedin_profile_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xl font-medium text-purple-900 hover:text-purple-900 hover:underline inline-flex items-center gap-1"
                                    >
                                      {exp.company}
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ) : (
                                    <p className="text-xl font-medium text-purple-900">
                                      {exp.company}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-lg text-purple-600 border-purple-200"
                                >
                                  {calculateTenure(
                                    exp.overall_start,
                                    exp.overall_end || null
                                  )}
                                </Badge>
                              </div>
                              {exp.funding_stages_during_tenure &&
                                formatFundingStages(
                                  exp.funding_stages_during_tenure
                                ) && (
                                  <Badge
                                    variant="secondary"
                                    className="text-base bg-emerald-50 text-emerald-700 border-emerald-200 mt-1"
                                  >
                                    {formatFundingStages(
                                      exp.funding_stages_during_tenure
                                    )}
                                  </Badge>
                                )}
                            </div>

                            <div className="space-y-4 pt-2">
                              {exp.roles.map((role, roleIndex) => (
                                <div
                                  key={roleIndex}
                                  className={`${
                                    roleIndex !== 0
                                      ? "border-t border-purple-100/50 pt-4"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-lg text-purple-800">
                                      {role.title}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-base text-purple-600/75 border-purple-200/75"
                                    >
                                      {calculateTenure(
                                        role.starts_at,
                                        role.ends_at || null
                                      )}
                                    </Badge>
                                  </div>
                                  <p className="text-base text-purple-600/75">
                                    {formatDate(role.starts_at)} -{" "}
                                    {role.ends_at
                                      ? formatDate(role.ends_at)
                                      : "Present"}
                                  </p>
                                  {role.description && (
                                    <div className="mt-2">
                                      <p className="text-lg text-muted-foreground">
                                        {role.description}
                                      </p>
                                    </div>
                                  )}
                                  {role.summarized_job_description && (
                                    <div className="mt-3 p-3 bg-purple-50 rounded-md">
                                      <p className="text-lg text-gray-700 font-medium">
                                        Generated Job Description
                                      </p>
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-medium text-base">
                                            Role Summary:
                                          </h4>
                                          <p className="text-gray-600 text-base">
                                            {
                                              role.summarized_job_description
                                                .role_summary
                                            }
                                          </p>
                                        </div>

                                        {role.summarized_job_description
                                          .skills && (
                                          <div>
                                            <h4 className="font-medium text-base">
                                              Skills:
                                            </h4>
                                            <ul className="list-disc list-inside text-gray-600 text-base pl-2 space-y-1">
                                              {role.summarized_job_description.skills.map(
                                                (
                                                  skill: string,
                                                  idx: number
                                                ) => (
                                                  <li key={idx}>{skill}</li>
                                                )
                                              )}
                                            </ul>
                                          </div>
                                        )}

                                        {role.summarized_job_description
                                          .requirements && (
                                          <div>
                                            <h4 className="font-medium text-base">
                                              Requirements:
                                            </h4>
                                            <ul className="list-disc list-inside text-gray-600 text-base pl-2 space-y-1">
                                              {role.summarized_job_description.requirements.map(
                                                (req: string, idx: number) => (
                                                  <li key={idx}>{req}</li>
                                                )
                                              )}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                      {role.summarized_job_description
                                        .sources &&
                                        role.summarized_job_description.sources
                                          .length > 0 && (
                                          <div className="mt-2 pt-2 border-t border-purple-100">
                                            <p className="text-base text-gray-500">
                                              Sources:
                                            </p>
                                            <div className="mt-1 space-y-1">
                                              {role.summarized_job_description.sources.map(
                                                (
                                                  source: string,
                                                  idx: number
                                                ) => (
                                                  <a
                                                    key={idx}
                                                    href={source}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block text-base text-purple-600 hover:text-purple-800 hover:underline truncate text-nowrap w-full"
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
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  )
                )}
              </div>
            </div>
          )}

          {candidate.profile?.education &&
            candidate.profile.education.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-purple-800/90 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Education
                </h4>
                <div className="space-y-4">
                  {candidate.profile.education.map((edu, index) => (
                    <Card key={index} className="border-purple-100/50">
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-purple-900 text-lg">
                            {edu.school}
                          </p>
                          {edu.university_tier &&
                            edu.university_tier !== "other" && (
                              <Badge
                                variant="secondary"
                                className="text-sm bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {edu.university_tier
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </Badge>
                            )}
                        </div>
                        <p className="text-base text-purple-700/90">
                          {edu.degree_name && edu.field_of_study
                            ? `${edu.degree_name} in ${edu.field_of_study}`
                            : edu.degree_name || edu.field_of_study}
                        </p>
                        {edu.starts_at && edu.ends_at && (
                          <p className="text-sm text-purple-600/75">
                            {formatDate(edu.starts_at)} -{" "}
                            {formatDate(edu.ends_at)}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          {candidate.citations && candidate.citations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-purple-900">Sources</h3>
              <div className="space-y-4">
                {candidate.citations.map((citation, index) => {
                  const citationWithIndex = { ...citation, index: index + 1 };
                  return (
                    <Card
                      key={index}
                      ref={(el) => {
                        if (el)
                          citationRefs.current[citationWithIndex.index] = el;
                      }}
                      className="overflow-hidden transition-all duration-300 hover:shadow-lg scroll-mt-6"
                    >
                      <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-200 text-purple-700 font-semibold text-lg">
                              {citationWithIndex.index}
                            </div>
                            <div>
                              <CardTitle className="text-lg font-medium text-purple-900">
                                {new URL(citationWithIndex.url).hostname}
                              </CardTitle>
                              <a
                                href={citationWithIndex.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-base text-purple-600 hover:text-purple-800 transition-colors flex items-center mt-1"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Visit source
                              </a>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "px-2 py-1 text-base font-medium",
                              citationWithIndex.confidence >= 0.8
                                ? "bg-green-100 text-green-800 border-green-200"
                                : citationWithIndex.confidence >= 0.6
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            )}
                          >
                            {Math.round(citationWithIndex.confidence * 100)}%
                            confidence
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <p className="text-lg text-gray-600 leading-relaxed">
                          {citationWithIndex.distilled_content}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CandidateSidebar;
