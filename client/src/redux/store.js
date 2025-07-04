import {createStore, applyMiddleware} from "redux"
import { thunk } from "redux-thunk"
import cartReducer from "./cart/cartReducer"
import productReducer from "./products/productReducer"
import userReducer from "./user/userReducer"
import {logger} from "redux-logger"
import { combineReducers } from "redux"
import orderReducer from "./order/orderReducer"
import detailsReducer from "./checkout/checkoutReducer"
import snackbarReducer from "./snackbar/snackbarReducer" 
import { searchReducer } from "./search/searchReducer"

import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
// import getStorage from "redux-persist/lib/storage/getStorage"

const persistConfig = {
    key: 'root',
    storage,
    blacklist: ["snackbarReducer"]
    // whitelist: ["userReducer", "detailsReducer"]
}

const rootReducer = combineReducers({productReducer, cartReducer, userReducer, orderReducer, detailsReducer, snackbarReducer, searchReducer})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(persistedReducer, applyMiddleware(logger, thunk))
export const persistor = persistStore(store)


// const store = createStore(rootReducer, applyMiddleware(logger, thunk))
// export default store