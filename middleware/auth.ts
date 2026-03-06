"use client";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  // Consider authenticated when a token exists
  return Boolean(localStorage.getItem("auth_token"));
}

export function setAuthenticated(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("admin_authenticated", "true");
  } else {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_authenticated");
  }
}

export function logout(): void {
  setAuthenticated(null);
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}

