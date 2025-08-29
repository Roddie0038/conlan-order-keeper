import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;   // set false on /login
  fallback?: React.ReactNode; // optional spinner
};

export function AuthGuard({ children, requireAuth = true, fallback = null }: AuthGuardProps) {
  const { auth } = useAuth();
  const location = useLocation();

  // Public routes: never block on UNKNOWN
  if (!requireAuth && auth.event === "UNKNOWN") {
    return <>{children}</>;
  }

  // Protected routes: briefly block while resolving initial session
  if (requireAuth && auth.event === "UNKNOWN") {
    return fallback ?? <div style={{padding:16}}>Checking authentication…</div>;
  }

  // Protected routes: not signed in -> redirect to /login
  if (requireAuth && !auth.userId) {
    console.warn("[AuthGuard] No session; redirecting to /login from", location.pathname);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect authenticated users away from /login (if you use this guard there)
  if (!requireAuth && auth.userId && location.pathname === "/login") {
    const from = (location.state as any)?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  // Signed in: render immediately (enrichment continues in background)
  return <>{children}</>;
}