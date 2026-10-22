import { describe, expect, it, vi } from 'vitest'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { Env } from '../types.js'
import { apiCall } from '../api-call.js'
import { registerKnowledgeTools } from './knowledge.js'
import { registerMemoryTools } from './memory.js'

vi.mock('../api-call.js', () => ({ apiCall: vi.fn() }))

type ToolResult = { isError?: boolean }
type ToolHandler = (input: Record<string, unknown>) => Promise<ToolResult>

function captureTools(register: (server: McpServer, env: Env) => void): Map<string, ToolHandler> {
  const handlers = new Map<string, ToolHandler>()
  const fakeServer = {
    tool: (...args: unknown[]) => {
      handlers.set(String(args[0]), args[args.length - 1] as ToolHandler)
    },
  } as unknown as McpServer
  register(fakeServer, { REQUIRE_SOURCE_TRACE: 'true' } as Env)
  return handlers
}

describe('Multica source trace policy', () => {
  it('rejects untraceable memory writes before calling the API', async () => {
    const handler = captureTools(registerMemoryTools).get('cortex_memory_store')
    if (!handler) throw new Error('memory.store handler was not registered')

    const result = await handler({ content: 'untraceable memory' })

    expect(result.isError).toBe(true)
    expect(apiCall).not.toHaveBeenCalled()
  })

  it('rejects untraceable knowledge writes before calling the API', async () => {
    const handler = captureTools(registerKnowledgeTools).get('cortex_knowledge_store')
    if (!handler) throw new Error('knowledge.store handler was not registered')

    const result = await handler({ title: 'Untraceable', content: 'untraceable knowledge' })

    expect(result.isError).toBe(true)
    expect(apiCall).not.toHaveBeenCalled()
  })
})
