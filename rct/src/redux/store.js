import { applyMiddleware, combineReducers, createStore } from "redux";
import storage from "redux-persist/lib/storage"; // uses localStorage
import { thunk } from "redux-thunk";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "./auth";
import cartReducer from "./cart";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};
let reducers = combineReducers({
  auth: authReducer,
  cart: cartReducer,
});
const persistedReducer = persistReducer(persistConfig, reducers);

let store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);

window.store = store;
export default store;
