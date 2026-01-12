import { afterEach, describe, expect, it, vi } from 'vitest'
import { client } from '../services/api/client'

describe('client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds the correct URL when the path has no leading slash', async () => {
    const response = {
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true }),
      text: vi.fn().mockResolvedValue(''),
    }

    const fetchMock = vi.fn().mockResolvedValue(response as Response)
    vi.stubGlobal('fetch', fetchMock)

    const data = await client<{ ok: boolean }>('products')

    expect(data).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/products',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      }),
    )
  })

  it('throws a readable error when the response is not ok', async () => {
    const response = {
      ok: false,
      json: vi.fn(),
      text: vi.fn().mockResolvedValue('Bad request'),
      status: 400,
    }

    const fetchMock = vi.fn().mockResolvedValue(response as Response)
    vi.stubGlobal('fetch', fetchMock)

    await expect(client('/products')).rejects.toThrow('Bad request')
  })
})
