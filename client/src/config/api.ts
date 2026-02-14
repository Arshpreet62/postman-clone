export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://postman-clone-ci4y.onrender.com";

export const apiUrl = (path: string) => {
  if (!path) return API_BASE_URL;
  return path.startsWith("/")
    ? `${API_BASE_URL}${path}`
    : `${API_BASE_URL}/${path}`;
};
