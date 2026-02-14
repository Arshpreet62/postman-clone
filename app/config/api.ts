"use client";

export const apiUrl = (path: string) => {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
};
