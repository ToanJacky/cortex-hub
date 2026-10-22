/**
 * Conductor is enabled by default for backwards compatibility. A deployment
 * that only needs MCP memory and code intelligence can opt out completely.
 */
export function isConductorEnabled(value = process.env['CORTEX_CONDUCTOR_ENABLED']): boolean {
  return value?.trim().toLowerCase() !== 'false'
}
