import { useEffect } from 'react'
import './App.css'
import ProductScreen from './components/ProductScreen'
import { useAppDispatch, useAppSelector } from './store/hooks'
import {
  fetchProducts,
  setSelectedProductId,
} from './store/slices/checkoutSlice'

function App() {
  const dispatch = useAppDispatch()
  const { products, status, errorMessage, selectedProductId } = useAppSelector(
    (state) => state.checkout,
  )

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  return (
    <div className="app">
      <header className="app__header">
        <p className="app__kicker">Step 1 of 3</p>
        <h1 className="app__title">Choose your product</h1>
        <p className="app__subtitle">
          Select a product to continue the checkout.
        </p>
      </header>

      <section className="app__content">
        {status === 'loading' && (
          <p className="app__status">Loading products...</p>
        )}
        {status === 'failed' && (
          <p className="app__status app__status--error" role="alert">
            {errorMessage ?? 'Unable to load products'}
          </p>
        )}

        {status === 'succeeded' && (
          <ProductScreen
            products={products}
            selectedProductId={selectedProductId}
            onSelect={(productId) => dispatch(setSelectedProductId(productId))}
          />
        )}
      </section>
    </div>
  )
}

export default App
