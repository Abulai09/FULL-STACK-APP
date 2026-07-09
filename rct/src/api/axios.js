import axios from "axios";
import store from "../redux/store";
import { logOutAC } from "../redux/auth";

const API_URL = process.env.REACT_APP_API_URL;

export const $api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers = [];
}

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

$api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ✅ Не перехватываем если нет ответа
    if (!error.response) throw error;

    // ✅ Не перехватываем не-401 ошибки
    if (error.response.status !== 401) throw error;

    // ✅ Не перехватываем если это сам запрос на refresh
    if (originalRequest.url?.includes("/auth/refresh")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw error;
    }

    // ✅ Не повторяем один и тот же запрос дважды
    if (originalRequest._retry) throw error;
    originalRequest._retry = true;

    if (isRefreshing) {
      // Ждём пока refresh завершится
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve($api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newToken = response.data.access_token;
      localStorage.setItem("token", newToken);
      isRefreshing = false;
      onRefreshed(newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return $api(originalRequest);
    } catch (e) {
      isRefreshing = false;
      onRefreshFailed();
      localStorage.removeItem("token");
      store.dispatch(logOutAC());
      throw e;
    }
  },
);
