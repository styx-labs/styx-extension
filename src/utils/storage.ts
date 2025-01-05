import type { EvaluationResponse } from "../types";

interface StorageData {
  jobDescription: string;
  evaluation: EvaluationResponse | null;
}

export const saveToStorage = async (data: Partial<StorageData>) => {
  await chrome.storage.local.set(data);
};

export const loadFromStorage = async (): Promise<StorageData> => {
  const data = await chrome.storage.local.get(["jobDescription", "evaluation"]);
  return {
    jobDescription: data.jobDescription || "",
    evaluation: data.evaluation || null,
  };
};
