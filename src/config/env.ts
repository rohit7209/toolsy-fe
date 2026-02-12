const required = (key: string, value?: string) => {
    if (!value) {
        throw new Error(`Missing environment variable ${key}`);
    }
    return value;
};
  
export const ENV = {
    API_BASE_URL: required(
        "VITE_API_BASE_URL",
        import.meta.env.VITE_API_BASE_URL
    ),
    API_BASE_PATH: required(
        "VITE_API_BASE_PATH",
        import.meta.env.VITE_API_BASE_PATH
    ),
};
  