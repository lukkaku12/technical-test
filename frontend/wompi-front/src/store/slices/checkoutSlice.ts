import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getProducts, type Product } from '../../services/api/products'

type CheckoutStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type CheckoutState = {
  currentStep: number
  products: Product[]
  status: CheckoutStatus
  selectedProductId: string | null
  errorMessage: string | null
}

const initialState: CheckoutState = {
  currentStep: 1,
  products: [],
  status: 'idle',
  selectedProductId: null,
  errorMessage: null,
}

export const fetchProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>('checkout/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    return await getProducts()
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load products'
    return rejectWithValue(message)
  }
})

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setSelectedProductId(state, action: PayloadAction<string>) {
      state.selectedProductId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.errorMessage = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.products = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.errorMessage =
          action.payload ?? action.error.message ?? 'Unable to load products'
      })
  },
})

export const { setSelectedProductId } = checkoutSlice.actions
export default checkoutSlice.reducer
