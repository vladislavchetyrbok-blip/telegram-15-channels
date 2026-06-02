export interface AdminAccessPlaceholder {
  allowed: boolean;
  mode: "placeholder";
  reason: string;
}

export function requireAdminAccessPlaceholder(): AdminAccessPlaceholder {
  // Placeholder only. Later replace this with ADMIN_PASSWORD, NextAuth, or basic auth
  // before exposing hosted admin pages on the public internet.
  return {
    allowed: true,
    mode: "placeholder",
    reason: "local_admin_access_allowed_until_real_auth_is_configured",
  };
}
