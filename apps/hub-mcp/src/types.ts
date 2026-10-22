/**
 * Hub MCP Environment configuration.
 */
export interface Env {
  // Backend service URLs
  QDRANT_URL: string
  CLIPROXY_URL: string
  DASHBOARD_API_URL: string

  // MCP Server metadata
  MCP_SERVER_NAME: string
  MCP_SERVER_VERSION: string

  // Auth (comma-separated API keys)
  API_KEYS: string

  // Comma-separated exact browser origins allowed to call /mcp.
  // Requests without Origin (typical terminal agents) remain supported.
  MCP_ALLOWED_ORIGINS?: string

  // Require an issue URL/ID or commit SHA on every memory/knowledge write.
  REQUIRE_SOURCE_TRACE?: string

  // Secret token for internal auth (e.g. cache invalidation)
  INTERNAL_API_SECRET?: string

  // Resolved at runtime from API key during auth
  // This is the authoritative identity of the caller (api_keys.name)
  API_KEY_OWNER?: string
}

