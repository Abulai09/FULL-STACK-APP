import { $api } from "./axios";

export const getRedisKeys = async (pattern = "*") => {
  const response = await $api.get("/redis/keys", { params: { pattern } });
  return response.data;
};

export const getRedisInfo = async () => {
  const response = await $api.get("/redis/info");
  return response.data;
};

export const getRedisKey = async (key) => {
  const response = await $api.get(`/redis/key/${encodeURIComponent(key)}`);
  return response.data;
};

export const deleteRedisKey = async (key) => {
  const response = await $api.delete(`/redis/key/${encodeURIComponent(key)}`);
  return response.data;
};
