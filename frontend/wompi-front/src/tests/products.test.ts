import { describe, expect, it, vi } from 'vitest'
import { getProducts } from '../services/api/products'
import { client } from '../services/api/client'

vi.mock('../services/api/client', () => ({
  client: vi.fn(),
}))

const clientMock = vi.mocked(client)

describe('products API', () => {
  it('calls the products endpoint', async () => {
    clientMock.mockResolvedValue([])

    await getProducts()

    expect(clientMock).toHaveBeenCalledWith('/products')
  })
})
