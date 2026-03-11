export type PermissionTier = 'read' | 'comment' | 'write'

export interface Permissions {
  read?: string[]
  comment?: string[]
  write?: string[]
}

const DEFAULTS: Record<PermissionTier, string[]> = {
  read: ['*'],
  comment: ['*'],
  write: [],
}

/**
 * Check if an email matches a single pattern.
 * - `"*"` → always true
 * - `"*@domain.com"` → email ends with `@domain.com`
 * - Anything else → exact string equality
 */
export function matchesPattern(email: string, pattern: string): boolean {
  if (pattern === '*') return true
  if (pattern.startsWith('*@')) {
    const domain = pattern.slice(1) // "@domain.com"
    return email.endsWith(domain)
  }
  return email === pattern
}

/**
 * Check whether a user (identified by email) has a given permission tier.
 *
 * - If email is null (unauthenticated), only `"*"` patterns grant access.
 * - Tiers not present in the permissions object fall back to DEFAULTS.
 *
 * Note: this is a UI-layer policy check only. All enforcement ultimately
 * rests on GitHub repository access controls.
 */
export function hasPermission(
  email: string | null,
  tier: PermissionTier,
  permissions: Permissions,
): boolean {
  const patterns = permissions[tier] ?? DEFAULTS[tier]
  if (email === null) {
    // Unauthenticated: only wildcard patterns apply
    return patterns.includes('*')
  }
  return patterns.some(pattern => matchesPattern(email, pattern))
}
