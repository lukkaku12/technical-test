import type { Product } from '../services/api/products'

type ProductScreenProps = {
  products: Product[]
  selectedProductId: string | null
  onSelect: (productId: string) => void
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)

const ProductScreen = ({
  products,
  selectedProductId,
  onSelect,
}: ProductScreenProps) => {
  if (products.length === 0) {
    return (
      <div className="product-empty">
        No products available right now.
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map((product) => {
        const isSelected = product.id === selectedProductId

        return (
          <article className="product-card" key={product.id}>
            <div className="product-card__header">
              <h2 className="product-card__name">{product.name}</h2>
              <p className="product-card__price">
                {formatPrice(product.price)}
              </p>
            </div>
            <p className="product-card__description">{product.description}</p>
            <div className="product-card__footer">
              <p className="product-card__meta">
                Available: {product.availableUnits}
              </p>
              <button
                className={`product-card__cta${isSelected ? ' is-selected' : ''}`}
                type="button"
                onClick={() => onSelect(product.id)}
                aria-pressed={isSelected}
              >
                {isSelected ? 'Selected' : 'Select product'}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default ProductScreen
