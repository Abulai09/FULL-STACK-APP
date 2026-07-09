import { $api } from "./axios";

// Все продукты с фильтрацией
export const getProducts = async (params = {}) => {
  const response = await $api.get("/product", { params });
  return response.data;
};

// Один продукт
export const getProduct = async (id) => {
  const response = await $api.get(`/product/${id}`);
  return response.data;
};

// Мои продукты
export const getMyProducts = async () => {
  const response = await $api.get("/product/my");
  return response.data;
};

// Создать продукт (form-data для фото)
export const createProduct = async (formData) => {
  const response = await $api.post("/product", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Обновить продукт
export const updateProduct = async (id, formData) => {
  const response = await $api.patch(`/product/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Удалить продукт
export const deleteProduct = async (id) => {
  const response = await $api.delete(`/product/${id}`);
  return response.data;
};
