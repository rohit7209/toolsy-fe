import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH;

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/${API_BASE_PATH}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});