import { describe, expect, it } from 'vitest'
import { isConductorEnabled } from './enabled.js'

describe('isConductorEnabled', () => {
  it('keeps the existing enabled default', () => {
    expect(isConductorEnabled(undefined)).toBe(true)
    expect(isConductorEnabled('')).toBe(true)
    expect(isConductorEnabled('true')).toBe(true)
  })

  it('accepts false without regard to surrounding whitespace or case', () => {
    expect(isConductorEnabled('false')).toBe(false)
    expect(isConductorEnabled(' FALSE ')).toBe(false)
  })
})
