import { $api } from "./axios";
import { setCartAC, setCartLoadingAC, clearCartAC } from "../redux/cart";

export const getCart = async () => {
  const response = await $api.get("/cart");
  return response.data;
};

export const fetchCart = () => async (dispatch) => {
  dispatch(setCartLoadingAC(true));
  try {
    const data = await getCart();
    dispatch(setCartAC(data));
  } catch (e) {
    console.log(e);
  } finally {
    dispatch(setCartLoadingAC(false));
  }
};

export const addToCart =
  (productId, quantity = 1) =>
  async (dispatch) => {
    try {
      await $api.post("/cart", { productId, quantity });
      dispatch(fetchCart()); // обновляем Redux
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

export const updateCartItem = (productId, quantity) => async (dispatch) => {
  try {
    await $api.patch("/cart", { productId, quantity });
    dispatch(fetchCart());
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const removeFromCart = (productId) => async (dispatch) => {
  try {
    await $api.delete(`/cart/${productId}`);
    dispatch(fetchCart());
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const clearCart = () => async (dispatch) => {
  try {
    await $api.delete("/cart");
    dispatch(clearCartAC());
  } catch (e) {
    console.log(e);
    throw e;
  }
};
