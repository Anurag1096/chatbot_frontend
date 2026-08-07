import { describe, expect, it } from 'vitest'
import { truncateTitle } from './conversations'

describe('truncateTitle', () => {
  it('returns trimmed text when under max length', () => {
    expect(truncateTitle('  Hello   world  ')).toBe('Hello world')
  })

  it('truncates long titles with ellipsis', () => {
    const long = 'a'.repeat(60)
    expect(truncateTitle(long)).toBe(`${'a'.repeat(47)}…`)
  })

  it('respects custom max length', () => {
    expect(truncateTitle('Hello world', 8)).toBe('Hello w…')
  })
})
