import type { EvaluationResponse } from "../types";
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
