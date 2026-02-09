// Environment configuration
const config = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  API_TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const;

export default config;
