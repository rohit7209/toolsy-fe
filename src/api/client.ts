import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');
const API_BASE_PATH = (import.meta.env.VITE_API_BASE_PATH ?? '').replace(/^\/+|\/+$/g, '');

if (!API_BASE_URL) {
  throw new Error("Missing VITE_API_BASE_URL");
}

export const apiClient = axios.create({
  baseURL: API_BASE_PATH ? `${API_BASE_URL}/${API_BASE_PATH}` : API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});