import { z } from 'zod'

/** References that keep derived agent context tied to the GitHub source. */
export const sourceRefsSchema = z
  .object({
    repo: z
      .string()
      .trim()
      .max(2048)
      .optional()
      .describe('Repository URL or canonical repository identifier'),
    issue: z
      .string()
      .trim()
      .max(2048)
      .optional()
      .describe('GitHub issue URL or canonical issue identifier'),
    commit: z
      .string()
      .trim()
      .regex(/^[0-9a-f]{7,64}$/i)
      .optional()
      .describe('Git commit SHA'),
  })
  .refine(
    (refs) => Boolean(refs.repo || refs.issue || refs.commit),
    'At least one source reference (repo, issue, or commit) is required',
  )

export type SourceRefs = z.infer<typeof sourceRefsSchema>

export function hasIssueOrCommitReference(sourceRefs: SourceRefs | undefined): boolean {
  return Boolean(sourceRefs?.issue || sourceRefs?.commit)
}

export function traceabilityBlock(sourceRefs: SourceRefs | undefined): string {
  if (!sourceRefs) return ''

  const lines = [
    sourceRefs.repo ? `- repo: ${sourceRefs.repo}` : null,
    sourceRefs.issue ? `- issue: ${sourceRefs.issue}` : null,
    sourceRefs.commit ? `- commit: ${sourceRefs.commit}` : null,
  ].filter((line): line is string => line !== null)

  return lines.length > 0
    ? `\n\nTraceability (GitHub remains the source of truth):\n${lines.join('\n')}`
    : ''
}

export function traceabilityTags(
  tags: string[] | undefined,
  sourceRefs: SourceRefs | undefined,
): string[] {
  const result = new Set(tags ?? [])
  if (sourceRefs?.repo || sourceRefs?.issue || sourceRefs?.commit) result.add('trace:github')
  if (sourceRefs?.issue) result.add('trace:issue')
  if (sourceRefs?.commit) result.add('trace:commit')
  return [...result]
}
