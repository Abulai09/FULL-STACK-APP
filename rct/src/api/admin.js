import { $api } from "./axios";

export const getUsers = async (params = {}) => {
  const response = await $api.get("/user", { params });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await $api.delete(`/user/${id}`);
  return response.data;
};
