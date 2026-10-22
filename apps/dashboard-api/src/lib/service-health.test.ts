import { describe, expect, it } from 'vitest'
import { dependencyHealthIsOk } from './service-health.js'

describe('dependencyHealthIsOk', () => {
  it('treats an unconfigured optional model proxy as healthy', () => {
    expect(dependencyHealthIsOk('cliproxy', 'not_configured')).toBe(true)
  })

  it('still reports configured optional model services that fail', () => {
    expect(dependencyHealthIsOk('cliproxy', 'error')).toBe(false)
    expect(dependencyHealthIsOk('ollama', 'error')).toBe(false)
  })

  it('requires the core services to be available', () => {
    expect(dependencyHealthIsOk('qdrant', 'not_configured')).toBe(false)
    expect(dependencyHealthIsOk('gitnexus', 'ok')).toBe(true)
  })
})
