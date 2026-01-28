import axios from 'axios';

const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL;
const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH;

export const apiClient = axios.create({
  baseURL: `${API_PROTOCOL}://${API_HOST}:${API_PORT}/${API_BASE_PATH}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});