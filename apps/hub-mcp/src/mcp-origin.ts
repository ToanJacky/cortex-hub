/**
 * Validate browser-supplied Origin headers for the Streamable HTTP MCP endpoint.
 *
 * MCP clients running in a terminal generally omit Origin and are allowed. A
 * browser-originated request must match an explicit, comma-separated allowlist;
 * an empty allowlist therefore fails closed for requests that carry Origin.
 */
export function isAllowedMcpOrigin(
  origin: string | undefined,
  configured: string | undefined,
): boolean {
  if (!origin) return true

  const normalizedOrigin = normalizeOrigin(origin)
  if (!normalizedOrigin) return false

  return (
    configured
      ?.split(',')
      .map((value) => normalizeOrigin(value.trim()))
      .filter((value): value is string => value !== null)
      .includes(normalizedOrigin) ?? false
  )
}

function normalizeOrigin(value: string): string | null {
  if (!value || value === 'null') return null

  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash ||
      parsed.username ||
      parsed.password
    )
      return null
    return parsed.origin
  } catch {
    return null
  }
}
