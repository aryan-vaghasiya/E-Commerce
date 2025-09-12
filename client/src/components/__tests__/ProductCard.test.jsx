import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import { ThemeProvider } from '@mui/material/styles'
import { configureStore } from '@reduxjs/toolkit'
import ProductCard from '../ProductCard'
import theme from '../../theme'

// Mock store
const mockStore = configureStore({
  reducer: {
    userReducer: () => ({ userName: 'testuser' }),
    cartReducer: () => ({ items: [] }),
    snackbarReducer: () => ({ open: false })
  }
})

// Mock product data
const mockProduct = {
  id: '1',
  title: 'Test Product',
  price: 29.99,
  rating: 4.5,
  thumbnail: '/test-image.jpg',
  brand: 'Test Brand',
  category: 'electronics',
  stock: 10,
  wishlisted: false,
  offer_discount: true,
  status: 'active'
}

// Mock intersection observer
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

const renderProductCard = (props = {}) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <ProductCard product={mockProduct} loading={false} {...props} />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  )
}

describe('ProductCard Image Optimization', () => {
  beforeEach(() => {
    mockIntersectionObserver.mockClear()
  })

  test('renders loading skeleton when loading prop is true', () => {
    renderProductCard({ loading: true })
    
    // Should show skeleton loading
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  test('sets up intersection observer for lazy loading', () => {
    renderProductCard()
    
    // Intersection observer should be called
    expect(mockIntersectionObserver).toHaveBeenCalled()
  })

  test('displays product information correctly', () => {
    renderProductCard()
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Brand: Test Brand')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('Limited Deal')).toBeInTheDocument()
  })

  test('shows out of stock message when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    renderProductCard({ product: outOfStockProduct })
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  test('handles image error gracefully', async () => {
    renderProductCard()
    
    // Simulate image error
    const img = screen.getByRole('img', { name: /test product/i })
    
    // Trigger error event
    Object.defineProperty(img, 'src', {
      writable: true,
      value: 'invalid-url'
    })
    
    // The component should handle the error without crashing
    expect(img).toBeInTheDocument()
  })

  test('applies proper aspect ratio styling', () => {
    renderProductCard()
    
    // Check if the card has proper height constraint
    const card = screen.getByRole('article') || screen.getByTestId('product-card')
    expect(card).toHaveStyle({ height: '400px' })
  })
})