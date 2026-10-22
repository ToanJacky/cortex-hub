import { describe, expect, it } from 'vitest'
import { isAllowedMcpOrigin } from './mcp-origin.js'

describe('isAllowedMcpOrigin', () => {
  it('allows non-browser MCP clients without an Origin header', () => {
    expect(isAllowedMcpOrigin(undefined, undefined)).toBe(true)
  })

  it('requires an exact configured origin for browser requests', () => {
    expect(isAllowedMcpOrigin('https://agent.example.com', 'https://agent.example.com')).toBe(true)
    expect(isAllowedMcpOrigin('https://agent.example.com', 'https://other.example.com')).toBe(false)
    expect(isAllowedMcpOrigin('https://agent.example.com', undefined)).toBe(false)
  })

  it('rejects wildcard, path, and non-http origins', () => {
    expect(isAllowedMcpOrigin('https://agent.example.com', '*')).toBe(false)
    expect(isAllowedMcpOrigin('https://agent.example.com', 'https://agent.example.com/mcp')).toBe(
      false,
    )
    expect(isAllowedMcpOrigin('file://agent.example.com', 'file://agent.example.com')).toBe(false)
  })

  it('normalizes a trailing slash and host casing', () => {
    expect(isAllowedMcpOrigin('HTTPS://AGENT.EXAMPLE.COM', 'https://agent.example.com/')).toBe(true)
  })
})
