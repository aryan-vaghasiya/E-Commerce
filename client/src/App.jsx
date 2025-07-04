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

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import NavBar2 from './components/NavBar2'

import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './redux/store'
import ProductsSearched from './components/ProductsSearched'
import Signup from './components/Signup'

function App() {

  // localStorage.clear() 

  return (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NavBar />
          {/* <NavBar2 /> */}
          <Routes>
            <Route path='/' element={<Products />} />
            <Route path='/products/:productId' element={<ProductPage />}/>
            <Route path='/products' element={<ProductsSearched />}/>
            <Route path='/cart' element={<MyCart />} />
            <Route path='/checkout' element={<CheckOut />} />
            <Route path='/order-complete' element={<OrderComplete />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/my-orders' element={<MyOrders />} />
          </Routes>
        </PersistGate>
      </Provider>
  )
}

export default App