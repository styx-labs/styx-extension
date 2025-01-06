import type { EvaluationResponse, Job } from "../types";
// import { scrapeProfile } from "./profileScraper";

export const evaluateProfile = async (
  jobDescription: string,
  linkedinUrl?: string
): Promise<EvaluationResponse> => {
  // const { fullName, profileContent } = scrapeProfile();
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/evaluate-headless`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_description: jobDescription || undefined,
        name: "",
        context: "",
        url: linkedinUrl,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to evaluate profile");
  }

  return response.json();
};

export const generateReachout = async (
  jobDescription: string,
  evaluation: EvaluationResponse,
  name: string = ""
): Promise<string> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/generate-reachout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job_description: jobDescription || undefined,
        name,
        sections: evaluation.sections,
        citations: evaluation.citations,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate reachout message");
  }

  const data = await response.json();
  return data;
};

export const getJobs = async (): Promise<Job[]> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Failed to get jobs: ${response.status}`
      );
    }

    const data = await response.json();
    return data.jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get jobs"
    );
  }
};

export const createCandidate = async (
  jobId: string,
  url: string
): Promise<string> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/jobs/${jobId}/candidates`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        candidate: {
          url: url,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create candidate");
  }

  return await response.json();
};
