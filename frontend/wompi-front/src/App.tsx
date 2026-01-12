import { useEffect } from 'react'
import './App.css'
import CheckoutFormSheet from './components/CheckoutFormSheet'
import ProductScreen from './components/ProductScreen'
import SummaryScreen from './components/SummaryScreen'
import { useAppDispatch, useAppSelector } from './store/hooks'
import {
  fetchProducts,
  setCurrentStep,
  setSelectedProductId,
} from './store/slices/checkoutSlice'
import { setSheetOpen } from './store/slices/formSlice'

function App() {
  const dispatch = useAppDispatch()
  const {
    products,
    status,
    errorMessage,
    selectedProductId,
    currentStep,
    baseFee,
    deliveryFee,
  } = useAppSelector((state) => state.checkout)
  const isSheetOpen = useAppSelector((state) => state.form.isSheetOpen)
  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? null

  const stepLabel =
    currentStep >= 3
      ? 'Step 3 of 3'
      : currentStep === 2
        ? 'Step 2 of 3'
        : 'Step 1 of 3'

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  return (
    <div className="app">
      <header className="app-header">
        <p className="app-kicker">{stepLabel}</p>
        <h1 className="app-title">
          {currentStep >= 3 ? 'Review your order' : 'Choose your product'}
        </h1>
        <p className="app-subtitle">
          {currentStep >= 3
            ? 'Check the totals before confirming.'
            : 'Select a product to continue the checkout.'}
        </p>
      </header>

      <section className="app-content">
        {status === 'loading' && (
          <p className="app-status">Loading products...</p>
        )}
        {status === 'failed' && (
          <p className="app-status app-status-error" role="alert">
            {errorMessage ?? 'Unable to load products'}
          </p>
        )}

        {status === 'succeeded' && currentStep < 3 && (
          <>
            <ProductScreen
              products={products}
              selectedProductId={selectedProductId}
              onSelect={(productId) => dispatch(setSelectedProductId(productId))}
            />
            <div className="app-actions">
              <button
                className="app-cta"
                type="button"
                onClick={() => {
                  dispatch(setSheetOpen(true))
                  dispatch(setCurrentStep(2))
                }}
                disabled={!selectedProductId}
              >
                Continue to details
              </button>
              {!selectedProductId && (
                <p className="app-helper">Select a product to continue.</p>
              )}
            </div>
          </>
        )}

        {status === 'succeeded' && currentStep >= 3 && (
          <SummaryScreen
            product={selectedProduct}
            baseFee={baseFee}
            deliveryFee={deliveryFee}
            onConfirm={() => dispatch(setCurrentStep(currentStep + 1))}
          />
        )}
      </section>

      <CheckoutFormSheet
        isOpen={isSheetOpen}
        onClose={() => {
          dispatch(setSheetOpen(false))
          dispatch(setCurrentStep(1))
        }}
        onContinue={() => {
          dispatch(setSheetOpen(false))
          dispatch(setCurrentStep(3))
        }}
      />
    </div>
  )
}

export default App
