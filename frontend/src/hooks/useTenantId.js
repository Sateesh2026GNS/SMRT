import useAuth from "./useAuth";

/** Current user's tenant id; falls back to 1 for legacy seed data. */
export default function useTenantId() {
  const { user } = useAuth();
  return user?.tenant_id ?? 1;
}
