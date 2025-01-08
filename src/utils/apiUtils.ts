import type { EvaluationResponse, Job } from "../types";

async function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_AUTH_TOKEN" }, (response) => {
      console.log("Got auth token from background:", response);
      resolve(response);
    });
  });
}

export async function checkAuth(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

export function openLogin() {
  chrome.runtime.sendMessage({ type: "OPEN_LOGIN" });
}

export const getJobs = async (): Promise<Job[] | null> => {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/jobs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get jobs: ${response.status}`);
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
): Promise<string | null> => {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/jobs/${jobId}/candidates`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidate: { url },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create candidate");
    }

    return response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create candidate"
    );
  }
};
