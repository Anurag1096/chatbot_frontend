import { describe, expect, it, beforeEach, vi } from 'vitest'
import { buildInitialState, clearStoredState, truncateTitle } from './conversations'
import { STORAGE_KEY } from './conversations'

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

describe('buildInitialState', () => {
  it('starts with an empty conversation', () => {
    const state = buildInitialState()

    expect(state.conversations).toHaveLength(1)
    expect(state.conversations[0].messages).toEqual([])
    expect(state.isStreaming).toBe(false)
    expect(state.globalError).toBeNull()
  })
})

describe('clearStoredState', () => {
  beforeEach(() => {
    const store = new Map<string, string>()

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
    })
  })

  it('removes persisted chat history', () => {
    localStorage.setItem(STORAGE_KEY, '{"conversations":[]}')

    clearStoredState()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
