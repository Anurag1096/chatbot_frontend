import { describe, expect, it } from 'vitest'
import {
  ApiError,
  NetworkError,
  StreamError,
  getErrorMessage,
  isAbortError,
} from './errors'

describe('getErrorMessage', () => {
  it('returns ApiError message', () => {
    expect(getErrorMessage(new ApiError('Not found', 404))).toBe('Not found')
  })

  it('returns NetworkError message', () => {
    expect(getErrorMessage(new NetworkError())).toBe(
      'Unable to reach the server. Check your connection.',
    )
  })

  it('returns StreamError message', () => {
    expect(getErrorMessage(new StreamError('Stream cut off'))).toBe('Stream cut off')
  })

  it('returns empty string for abort errors', () => {
    expect(getErrorMessage(new DOMException('Aborted', 'AbortError'))).toBe('')
  })

  it('returns generic message for unknown values', () => {
    expect(getErrorMessage('unexpected')).toBe('Something went wrong. Please try again.')
  })
})

describe('isAbortError', () => {
  it('detects AbortError DOMException', () => {
    expect(isAbortError(new DOMException('Aborted', 'AbortError'))).toBe(true)
  })

  it('returns false for other errors', () => {
    expect(isAbortError(new Error('fail'))).toBe(false)
  })
})
