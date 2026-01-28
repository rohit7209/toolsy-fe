import { apiClient } from "../client";
import type { FormatOptions } from "../../pages/JsonFormatter/OptionsHeader";

export type JSONFormatterResponse = {
    success: boolean;
    data?: string;
    error?: string;
};

export const formatJson = async (json: string, options: FormatOptions): Promise<JSONFormatterResponse> => {
    const res = await apiClient.post("/json/format", {
        jsonString: json,
        options: options
    });

    if(res.data.success) {
        return res.data.data as JSONFormatterResponse;
    } else {
        throw new Error(res.data.error);
    }
};
