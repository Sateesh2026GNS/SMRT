import { userCanAccess, userCanAction, getEffectivePermissions, isAdmin, isOperator } from "../config/permissions";
import useAuth from "./useAuth";

export default function usePermissions() {
  const { user } = useAuth();
  return {
    user,
    isAdmin: isAdmin(user),
    isOperator: isOperator(user),
    permissions: getEffectivePermissions(user),
    roles: user?.roles || (user?.role ? [user.role] : []),
    can: (module) => userCanAccess(user, module),
    canAction: (module, action) => userCanAction(user, module, action),
  };
}
