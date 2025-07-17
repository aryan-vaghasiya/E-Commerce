import NavBar from './components/NavBar'
import Products from './components/Products'
import {Provider} from "react-redux"
import { Route, Routes } from "react-router"
import MyCart from './components/MyCart'
import CheckOut from './components/CheckOut'
import OrderComplete from './components/OrderComplete'
import Login from './components/Login'
import MyOrders from './components/MyOrders'
import ProductPage from './components/ProductPage'
import UserLayout from './components/layouts/UserLayout'
import AdminLayout from './components/layouts/AdminLayout'
import { BrowserRouter } from 'react-router'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import NavBar2 from './components/NavBar2'

import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './redux/store'
import ProductsSearched from './components/ProductsSearched'
import Signup from './components/Signup'
import MyWishlist from './components/MyWishlist'
import AdminNavBar from './components/AdminNavbar'
import AdminDashboard from './components/AdminDashboard'
import AdminLogin from './components/AdminLogin'
import AdminOrders from './components/AdminOrders'
import AdminOrderPage from './components/AdminOrderPage'
import AdminProducts from './components/AdminProducts'
import AdminProductsPage from './components/AdminProductsPage'
import AdminAddProduct from './components/AdminAddProduct'

function App() {

  // localStorage.clear() 

  return (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            {/* <NavBar /> */}
            <Routes>

              <Route element={<UserLayout />}>
                <Route path='/' element={<Products />} />
                <Route path='/products/:productId' element={<ProductPage />}/>
                <Route path='/products' element={<ProductsSearched />}/>
                <Route path='/cart' element={<MyCart />} />
                <Route path='/checkout' element={<CheckOut />} />
                <Route path='/order-complete' element={<OrderComplete />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/my-orders' element={<MyOrders />} />
                <Route path='/my-wishlist' element={<MyWishlist />} />
              </Route>

              <Route element={<AdminLayout />}>
                <Route path='/admin' element={<AdminLogin />} />
                <Route path='/admin/dashboard' element={<AdminDashboard />} />
                <Route path='/admin/sales' element={<AdminOrders />} />
                <Route path='/admin/order/:orderId' element={<AdminOrderPage />} />
                <Route path='/admin/products' element={<AdminProducts />} />
                <Route path='/admin/product/:productId' element={<AdminProductsPage />} />
                <Route path='/admin/product/add' element={<AdminAddProduct />} />
              </Route>

            </Routes>
          </BrowserRouter>
        </PersistGate>
      </Provider>
  )
}

export default App