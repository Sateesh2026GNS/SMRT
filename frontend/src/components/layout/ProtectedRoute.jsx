import { Navigate, useLocation } from "react-router-dom";

import AccessDenied from "../admin/AccessDenied";
import { getModuleForPath, userCanAccess } from "../../config/permissions";
import useAuth from "../../hooks/useAuth";

/**
 * Requires JWT auth + module permission for the current path.
 * Unauthorized users see a 403 Access Denied page (no silent redirect).
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const module = getModuleForPath(location.pathname);
  if (!userCanAccess(user, module)) {
    return <AccessDenied message="You do not have permission to access this module." />;
  }

  return children;
}
