"use client";

const ACCESS_KEY = "lumora_access_token";
const REFRESH_KEY = "lumora_refresh_token";

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getAccessToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ACCESS_KEY) || "";
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
