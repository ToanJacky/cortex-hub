# Multica integration: shared memory and code intelligence

This integration exposes Cortex Hub to Multica coding agents through the standard MCP Streamable HTTP endpoint. It is intentionally limited to shared memory, selective knowledge, and code intelligence. For the `fz-tools` POC, `CORTEX_CONDUCTOR_ENABLED=false` disables the API route, scheduler, and WebSocket; no task tree, delegation, routing, review orchestration, or worker service is required.

## Source-of-truth boundary

GitHub Issues, pull requests, and commits are authoritative. Cortex is a derived, searchable cache. A write should be accepted only when an agent has extracted a reusable fact, architecture decision, resolved failure, or code-navigation insight. In the POC, every memory or knowledge write is rejected unless it carries `sourceRefs.issue` or `sourceRefs.commit`; include `sourceRefs.repo` when available. The MCP server persists those references in the derived content and trace metadata.

Do not copy whole issue threads. Do not store API keys, bearer tokens, credentials, private customer data, or unreviewed speculative conclusions.

## Deployment configuration

For the `fz-tools` k3s deployment, the MCP URL is `https://multica-api.home.arpa/mcp`. The application is managed by Argo CD from `apps/fz-tools/dev/cortex-hub`; the API and data services remain ClusterIP-only. Infisical path `/fztools/cortex-hub` supplies the Cortex service secret. The separate path `/fztools/multica-cortex` holds the restricted MCP key for the local Multica daemon. Never put that bearer key in Git, a Kubernetes Secret, or Multica's database/API.

For Docker Compose deployments, set:

```dotenv
INTERNAL_API_SECRET=<random-secret-shared-by-cortex-api-and-cortex-mcp>
MCP_ALLOWED_ORIGINS=https://agent.example.com
```

`INTERNAL_API_SECRET` protects dashboard-to-MCP cache invalidation. `MCP_ALLOWED_ORIGINS` is an exact comma-separated browser-origin allowlist. Terminal/IDE clients that omit `Origin` remain supported; an Origin-bearing request is rejected with HTTP 403 when it does not match the allowlist. Never use `*` as an origin.

Create a dedicated API key and grant only the following permissions for the POC:

```text
cortex.session.start
cortex.session.end
cortex.memory.store
cortex.memory.search
cortex.knowledge.store
cortex.knowledge.search
cortex.code.search
cortex.code.context
cortex.code.impact
cortex.list.repos
cortex.cypher
cortex.detect.changes
cortex.health
```

Leave `cortex.code.reindex` and every Conductor/task/agent permission disabled. The `scope` label helps operators identify the key but is not a substitute for the permission list.

The `fz-tools` release sets `CORTEX_CONDUCTOR_ENABLED=false`, which omits the `/api/conductor` route and skips the scheduler and WebSocket setup. This does not change the upstream default for other installations. Keep Conductor permissions out of the Multica key.

## Multica connection

Configure the supported Multica daemon on the machine where the coding agent runs:

```sh
export MULTICA_CORTEX_MCP_URL=https://multica-api.home.arpa/mcp
export MULTICA_CORTEX_MCP_API_KEY='<dedicated-key>'
```

When the URL has no path, Multica defaults it to `/mcp`. It injects the connection only into supported runtime adapters, keeps the bearer key local to the daemon launch, and exposes only a redacted server inventory. A same-name agent-local `cortex-hub` entry cannot override the deployment entry.

## Verification

1. `GET /health` returns `status: healthy` without a key.
2. A valid key can initialize MCP and call `cortex_health`.
3. An invalid key receives HTTP 401.
4. A browser Origin outside `MCP_ALLOWED_ORIGINS` receives HTTP 403.
5. `tools/list` does not include task/conductor tools for the restricted key.
6. A memory or knowledge write returns an ID and the stored result contains the GitHub source references.
7. Multica's capability inventory contains no URL, Authorization header, or key value.

## Benchmarking

Measure the MCP transport separately from model tokens. Repeat read-only `tools/list` and `cortex_memory_search` calls with the same key and query. Record first-call latency, warm-cache p50/p95, response bytes, and the agent's prompt/output token counts in an equivalent Multica turn. The first call includes API-key verification; subsequent calls should exercise the MCP auth cache until its configured TTL expires.

The Multica repository contains `scripts/benchmark-cortex-mcp.mjs`, which performs the read-only MCP calls and prints a small JSON summary. Use the same repository, model, prompt, and result limit for before/after comparisons.

## Rollback

Rollback is additive and reversible:

1. Remove `MULTICA_CORTEX_MCP_URL` and `MULTICA_CORTEX_MCP_API_KEY` from the Multica daemon environment/Infisical source and let GitOps restart the backend.
2. Revoke the dedicated Cortex key if the integration is permanently removed.
3. Delete derived Cortex records by ID only when required; preserve GitHub Issues and commits.
4. If the hardening release itself must be reverted, pin the previous Cortex MCP/API image digests and keep the database and Qdrant volumes intact.

No GitHub mutation, Conductor activation, or issue rewrite is part of this POC. The standard Cortex API startup still applies its normal schema migrations.
