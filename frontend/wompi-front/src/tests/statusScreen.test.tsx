import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import StatusScreen from '../components/StatusScreen'

describe('StatusScreen', () => {
  it('shows the pending status', () => {
    render(<StatusScreen status="PENDING" onReturn={() => {}} />)

    expect(screen.getByText('PENDING')).toBeInTheDocument()
    expect(screen.getByText('Payment pending')).toBeInTheDocument()
  })
})
