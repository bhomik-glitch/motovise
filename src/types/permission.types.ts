// ─────────────────────────────────────────────────────────
// Permission Types — Admin Panel
// Permissions are dynamic (driven by the DB permission matrix).
// We use a string-keyed record — NO hardcoded enums.
// ─────────────────────────────────────────────────────────

/**
 * A single permission key as returned by the backend.
 * Examples: "ORDER_VIEW", "PRODUCT_EDIT", "RISK_MANAGE"
 * Typed as string to remain fully dynamic — never enumerate here.
 */
export type PermissionKey = string;

/**
 * The full permission matrix for the current user.
 * { "ORDER_VIEW": true, "PRODUCT_DELETE": false, ... }
 */
export type PermissionMatrix = Record<PermissionKey, boolean>;

/**
 * Context value for permission-aware components.
 */
export interface PermissionContext {
    permissions: PermissionMatrix;
    hasPermission: (key: PermissionKey) => boolean;
}
