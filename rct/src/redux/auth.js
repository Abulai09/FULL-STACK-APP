let initialState = {
  isAuth: false,
  payload: null,
};

let authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "setAuth":
      return {
        ...state,
        isAuth: true,
        payload: action.payload,
      };
    case "logOut":
      return {
        ...state,
        isAuth: false,
        payload: [],
      };

    default:
      return state;
  }
};

export const setAuthAC = (payload) => ({ type: "setAuth", payload });
export const logOutAC = () => ({ type: "logOut" });

export default authReducer;
