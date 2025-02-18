import type { Job, LinkedinContext, Candidate } from "../types";

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
  url: string,
  name?: string,
  context?: string,
  public_identifier?: string,
  search_mode = false
): Promise<string | null> => {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const body: Record<string, string> = {};
    if (name) body.name = name;
    if (context) body.context = context;
    if (public_identifier) body.public_identifier = public_identifier;
    body.url = url;
    body.search_mode = search_mode ? "true" : "false";

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
      if (response.status === 402) {
        throw new Error("Out of search credits");
      }
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
  urls: string[],
  search_mode: boolean = false
): Promise<string | null> => {
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
        body: JSON.stringify({ urls, search_mode }),
      }
    );

    if (!response.ok) {
      if (response.status === 402) {
        throw new Error("Out of search credits");
      }
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

export const getCandidates = async (
  jobId: string,
  filterTraits?: string[],
  status: "complete" | "processing" = "complete"
): Promise<{ candidates: Candidate[] } | null> => {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const queryParams = new URLSearchParams();
    if (filterTraits && filterTraits.length > 0) {
      queryParams.append("filter_traits", filterTraits.join(","));
    }
    queryParams.append("status", status);

    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/jobs/${jobId}/candidates?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get candidates: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get candidates"
    );
  }
};

export const getEmail = async (
  linkedinUrl: string
): Promise<{ data: { email: string } }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/get_email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ linkedin_url: linkedinUrl }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get email: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Error getting email:", error);
    throw error;
  }
};

export const getCandidateReachout = async (
  jobId: string,
  candidateId: string,
  format: string
): Promise<{ data: { reachout: string } }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/jobs/${jobId}/candidates/${candidateId}/generate-reachout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ format }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get reachout message: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("Error getting reachout message:", error);
    throw error;
  }
};

export const deleteCandidate = async (
  jobId: string,
  candidateId: string
): Promise<void> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/jobs/${jobId}/candidates/${candidateId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete candidate: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting candidate:", error);
    throw error;
  }
};

export async function getSearchCredits(): Promise<number> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/get-search-credits`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch search credits");
  }

  const data = await response.json();
  return data.search_credits;
}

export const getCandidate = async (
  jobId: string,
  candidateId: string
): Promise<Candidate | null> => {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/jobs/${jobId}/candidates/${candidateId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to get candidate: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching candidate:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to get candidate"
    );
  }
};

export const toggleFavorite = async (
  jobId: string,
  candidateId: string
): Promise<boolean> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/jobs/${jobId}/candidates/${candidateId}/favorite`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to toggle favorite: ${response.status}`);
    }

    const data = await response.json();
    return data.favorite;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to toggle favorite"
    );
  }
};
