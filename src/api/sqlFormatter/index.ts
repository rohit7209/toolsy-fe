import { apiClient } from '../client';

export type SqlFormatOptions = {
  indent: number;
  indentType: 'spaces' | 'tabs';
  keywordCase: 'upper' | 'lower' | 'none';
  minify: boolean;
};

export const formatSql = async (
  sql: string,
  options: SqlFormatOptions
): Promise<string> => {
  const res = await apiClient.post<{ success: boolean; data?: string; error?: string }>(
    '/sql/format',
    { sqlString: sql, options }
  );
  if (res.data.success && res.data.data != null) {
    return res.data.data;
  }
  throw new Error(res.data.error ?? 'Format failed');
};
