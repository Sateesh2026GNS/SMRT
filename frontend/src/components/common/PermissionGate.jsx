import { userCanAction, userCanAccess } from "../../config/permissions";
import useAuth from "../../hooks/useAuth";

/**
 * Conditionally render children when the user has module (and optional action) access.
 */
export default function PermissionGate({ module, action, children, fallback = null }) {
  const { user } = useAuth();
  if (!user) return fallback;
  if (action) {
    return userCanAction(user, module, action) ? children : fallback;
  }
  return userCanAccess(user, module) ? children : fallback;
}
