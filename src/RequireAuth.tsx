import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "./auth";
import type { JSX } from "react";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
