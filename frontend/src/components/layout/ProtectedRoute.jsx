import { Navigate, useLocation } from "react-router-dom";

import AccessDenied from "../admin/AccessDenied";
import { getModuleForPath, userCanAccess } from "../../config/permissions";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const module = getModuleForPath(location.pathname);
  if (!userCanAccess(user, module)) {
    return <AccessDenied module={module} />;
  }

  return children;
}
