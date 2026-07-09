const initialState = {
  items: [],
  total: 0,
  count: 0,
  loading: false,
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case "cart/setCart":
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        count: action.payload.count,
      };
    case "cart/setLoading":
      return { ...state, loading: action.payload };
    case "cart/clear":
      return { ...initialState };
    default:
      return state;
  }
};

export const setCartAC = (data) => ({ type: "cart/setCart", payload: data });
export const setCartLoadingAC = (bool) => ({
  type: "cart/setLoading",
  payload: bool,
});
export const clearCartAC = () => ({ type: "cart/clear" });

export default cartReducer;
