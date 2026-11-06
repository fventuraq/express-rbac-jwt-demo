// src/api/adminService.js
import axiosInstance from './axiosInstance';

export const fetchViews = async () => {
  const response = await axiosInstance.get('/views');
  return response.data;
};

export const createView = async (data) => {
  const response = await axiosInstance.post('/views', data);
  return response.data;
};

export const updateView = async (id, data) => {
  const response = await axiosInstance.put(`/views/${id}`, data);
  return response.data;
};

export const deleteView = async (id) => {
  const response = await axiosInstance.delete(`/views/${id}`);
  return response.data;
};