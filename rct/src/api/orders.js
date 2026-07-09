import { $api } from "./axios";

// Создать заказ из корзины
export const createOrder = async (address = "") => {
  const response = await $api.post("/order", { address });
  return response.data;
};

// Мои заказы
export const getMyOrders = async () => {
  const response = await $api.get("/order/my");
  return response.data;
};

// Один заказ
export const getOrder = async (id) => {
  const response = await $api.get(`/order/${id}`);
  return response.data;
};

// Отменить заказ
export const cancelOrder = async (id) => {
  const response = await $api.patch(`/order/${id}/cancel`);
  return response.data;
};

// Все заказы (admin)
export const getAllOrders = async () => {
  const response = await $api.get("/order/all");
  return response.data;
};

// Обновить статус (admin)
export const updateOrderStatus = async (id, status) => {
  const response = await $api.patch(`/order/${id}/status`, { status });
  return response.data;
};
