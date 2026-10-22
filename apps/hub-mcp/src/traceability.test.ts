import { describe, expect, it } from 'vitest'
import { hasIssueOrCommitReference, traceabilityBlock, traceabilityTags } from './traceability.js'

describe('traceability helpers', () => {
  it('renders source references without changing the source-of-truth boundary', () => {
    const refs = {
      repo: 'https://github.com/example/multica',
      issue: 'https://github.com/example/multica/issues/123',
      commit: '0123456789abcdef0123456789abcdef01234567',
    }

    expect(traceabilityBlock(refs)).toContain('GitHub remains the source of truth')
    expect(traceabilityBlock(refs)).toContain(refs.issue)
    expect(traceabilityBlock(refs)).toContain(refs.commit)
  })

  it('adds searchable trace tags and preserves caller tags', () => {
    expect(traceabilityTags(['deployment'], { issue: 'issue-123' })).toEqual([
      'deployment',
      'trace:github',
      'trace:issue',
    ])
    expect(traceabilityTags(['trace:github'], { commit: '0123456' })).toEqual([
      'trace:github',
      'trace:commit',
    ])
  })

  it('requires an issue or commit reference for trace-gated writes', () => {
    expect(hasIssueOrCommitReference(undefined)).toBe(false)
    expect(hasIssueOrCommitReference({ repo: 'multica-ai/multica' })).toBe(false)
    expect(hasIssueOrCommitReference({ issue: 'https://github.com/multica-ai/multica/issues/42' })).toBe(true)
    expect(hasIssueOrCommitReference({ commit: '0123456789abcdef' })).toBe(true)
  })
})
