import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import type { Candidate, TraitEvaluation } from "@/types";
import { getEmail, getCandidateReachout } from "@/utils/apiUtils";
import toast from "react-hot-toast";
import { connectAndMessage } from "@/utils/linkedinUtils";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

const TraitEvaluationItem: React.FC<{ evaluation: TraitEvaluation }> = ({
  evaluation,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="p-4 border border-purple-200 rounded-lg hover:border-purple-300 transition-all">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-lg font-medium text-purple-900">
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
        <div className="text-base text-muted-foreground mt-3 pl-3 border-l-2 border-purple-200">
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
              <h3 className="text-xl font-semibold text-purple-900">
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
            {candidate.sections?.map((section, index) => (
              <TraitEvaluationItem key={index} evaluation={section} />
            ))}
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
            <div>
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5" />
                Experience
              </h3>
              <div className="space-y-4">
                {candidate.profile.experiences.map((experience, index) => (
                  <div
                    key={index}
                    className="p-5 border bg-card text-card-foreground shadow border-purple-100/50 rounded-lg transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-purple-900">
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
                          <p className="text-base text-purple-700">
                            {experience.company}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-base text-purple-600">
                            {formatDate(experience.starts_at)} -{" "}
                            {experience.ends_at
                              ? formatDate(experience.ends_at)
                              : "Present"}
                          </p>
                          <span className="text-base bg-purple-100 text-purple-700 px-3 py-1 rounded-full ml-3">
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
                      <div className="space-y-4 pt-3 border-t border-purple-200 mt-4">
                        <p className="text-lg">{experience.description}</p>
                        {experience.summarized_job_description && (
                          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                            <p className="text-lg font-medium text-purple-900 mb-4">
                              Generated Job Description
                            </p>
                            <div className="space-y-5">
                              <div>
                                <h4 className="font-medium text-lg text-purple-800 mb-2">
                                  Role Summary:
                                </h4>
                                <p className="text-base text-purple-600">
                                  {
                                    experience.summarized_job_description
                                      .role_summary
                                  }
                                </p>
                              </div>

                              <div>
                                <h4 className="font-medium text-base text-purple-800 mb-2">
                                  Skills:
                                </h4>
                                <ul className="list-disc list-inside text-base text-purple-600 space-y-1.5 ml-2">
                                  {experience.summarized_job_description.skills?.map(
                                    (skill, idx) => (
                                      <li key={idx}>{skill}</li>
                                    )
                                  )}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium text-base text-purple-800 mb-2">
                                  Requirements:
                                </h4>
                                <ul className="list-disc list-inside text-base text-purple-600 space-y-1.5 ml-2">
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
                              <div className="mt-4 pt-3 border-t border-purple-200">
                                <p className="text-base text-purple-700 mb-2">
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
                <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </h3>
                <div className="space-y-4">
                  {candidate.profile.education.map((edu, index) => (
                    <div
                      key={index}
                      className="p-5 border bg-card text-card-foreground shadow border-purple-100/50 rounded-lg transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-lg font-medium text-purple-900">
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
                      <p className="text-base text-purple-700 mt-1">
                        {edu.degree_name && edu.field_of_study
                          ? `${edu.degree_name} in ${edu.field_of_study}`
                          : edu.degree_name || edu.field_of_study}
                      </p>
                      {edu.starts_at && edu.ends_at && (
                        <p className="text-base text-purple-600 mt-1">
                          {formatDate(edu.starts_at)} -{" "}
                          {formatDate(edu.ends_at)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {candidate.citations && candidate.citations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <Link className="w-5 h-5" />
                Sources
              </h3>
              <div className="space-y-4">
                {candidate.citations.map((citation, index) => (
                  <div
                    key={index}
                    className="p-5 border bg-card text-card-foreground shadow border-purple-100/50 rounded-lg transition-all"
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
                      <span className="text-base text-purple-600">
                        Confidence: {Math.round(citation.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-base text-purple-600">
                      {citation.distilled_content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CandidateSidebar;
