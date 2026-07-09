import { jwtDecode } from "jwt-decode";
import { $api } from "./axios";
import { logOutAC, setAuthAC } from "../redux/auth";

// ✅ Выносим повторяющуюся логику в хелпер
const saveTokenAndDispatch = (token, dispatch) => {
  localStorage.setItem("token", token);
  const decoded = jwtDecode(token);
  dispatch(
    setAuthAC({
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    }),
  );
};

export const login = (username, password) => {
  return async (dispatch) => {
    try {
      const response = await $api.post("/auth/login", { username, password });

      const token = response.data; // ← бэкенд возвращает просто строку
      saveTokenAndDispatch(token, dispatch);
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
};

export const registration = (username, email, password) => {
  return async (dispatch) => {
    try {
      const response = await $api.post("/auth/registration", {
        username,
        email,
        password,
      });

      const token = response.data.userData.access_token; // ← бэкенд возвращает объект
      saveTokenAndDispatch(token, dispatch);
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
};

export const logOut = () => {
  return async (dispatch) => {
    try {
      await $api.post("/auth/logOut");
      localStorage.removeItem("token");
      dispatch(logOutAC());
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
};
