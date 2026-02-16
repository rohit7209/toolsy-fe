import { apiClient } from '../client';

const postAi = async (
  path: string,
  sqlString: string,
  instruction?: string
): Promise<string> => {
  const body = instruction?.trim()
    ? { sqlString, instruction: instruction.trim() }
    : { sqlString };
  const res = await apiClient.post<{ success: boolean; data?: string; error?: string }>(
    path,
    body
  );
  if (res.data.success && res.data.data != null) {
    return res.data.data;
  }
  throw new Error(res.data.error ?? 'Request failed');
};

export const fixSql = async (sqlString: string, instruction?: string): Promise<string> => {
  return postAi('/sql/ai/fix', sqlString, instruction);
};

export const suggestSql = async (sqlString: string, instruction?: string): Promise<string> => {
  return postAi('/sql/ai/suggest', sqlString, instruction);
};

export const explainSql = async (sqlString: string, instruction?: string): Promise<string> => {
  return postAi('/sql/ai/explain', sqlString, instruction);
};
