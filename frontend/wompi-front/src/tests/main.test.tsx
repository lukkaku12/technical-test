import { describe, expect, it, vi } from 'vitest'

const renderMock = vi.fn()
const createRootMock = vi.fn(() => ({ render: renderMock }))

vi.mock('react-dom/client', () => ({
  createRoot: createRootMock,
}))

vi.mock('../App.tsx', () => ({
  default: () => null,
}))

describe('main entry', () => {
  it('creates the root and renders the app', async () => {
    document.body.innerHTML = '<div id="root"></div>'

    await import('../main.tsx')

    const rootElement = document.getElementById('root')
    expect(createRootMock).toHaveBeenCalledWith(rootElement)
    expect(renderMock).toHaveBeenCalled()
  })
})
