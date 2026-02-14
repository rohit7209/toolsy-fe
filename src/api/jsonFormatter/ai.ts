import { apiClient } from "../client";

const postAi = async (
  path: string,
  jsonString: string,
  instruction?: string
): Promise<string> => {
  const body = instruction?.trim()
    ? { jsonString, instruction: instruction.trim() }
    : { jsonString };
  const res = await apiClient.post<{ success: boolean; data?: string; error?: string }>(
    path,
    body
  );
  if (res.data.success && res.data.data != null) {
    return res.data.data;
  }
  throw new Error(res.data.error ?? "Request failed");
};

export const fixJson = async (jsonString: string, instruction?: string): Promise<string> => {
  return postAi("/json/ai/fix", jsonString, instruction);
};

export const suggestJson = async (jsonString: string, instruction?: string): Promise<string> => {
  return postAi("/json/ai/suggest", jsonString, instruction);
};

export const explainJson = async (jsonString: string, instruction?: string): Promise<string> => {
  return postAi("/json/ai/explain", jsonString, instruction);
};
