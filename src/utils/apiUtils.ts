import type { EvaluationResponse, Job, LinkedinContext } from "../types";

async function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_AUTH_TOKEN" }, (response) => {
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

export const getRecommendedJobs = async (
  context: string
): Promise<Job[] | null> => {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/jobs_recommend?context=${encodeURIComponent(context)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get recommended jobs: ${response.status}`);
    }

    const data = await response.json();
    return data.jobs;
  } catch (error) {
    console.error("Error fetching recommended jobs:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get recommended jobs"
    );
  }
};

export const createCandidate = async (
  jobId: string,
  url?: string,
  name?: string,
  context?: string,
  public_identifier?: string
): Promise<string | null> => {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const body: Record<string, string> = {};
    if (url) body.url = url;
    if (name) body.name = name;
    if (context) body.context = context;
    if (public_identifier) body.public_identifier = public_identifier;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/jobs/${jobId}/candidates`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
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

export const getLinkedinContext = async (
  url: string
): Promise<LinkedinContext | null> => {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/get_linkedin_context?url=${encodeURIComponent(url)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get linkedin context: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching linkedin context:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get linkedin context"
    );
  }
};

export const createCandidatesBulk = async (
  jobId: string,
  urls: string[]
): Promise<{ processed: number; total: number } | null> => {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/jobs/${jobId}/candidates_bulk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ urls }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create candidates in bulk");
    }

    return response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create candidates in bulk"
    );
  }
};
