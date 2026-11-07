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

/*=============FUNCTIONS==============*/
export const fetchFunctions = async () => {
  const response = await axiosInstance.get('/functions');
  return response.data;
};

export const createFunction= async (data) => {
  const response = await axiosInstance.post('/functions', data);
  return response.data;
};

export const updateFunction = async (id, data) => {
  const response = await axiosInstance.put(`/functions/${id}`, data);
  return response.data;
};

export const deleteFunction = async (id) => {
  const response = await axiosInstance.delete(`/functions/${id}`);
  return response.data;
};

/*=============ROLES==============*/
export const fetchRoles = async () => {
  const response = await axiosInstance.get('/roles');
  return response.data;
};

export const createRol = async (data) => {
  const response = await axiosInstance.post('/roles', data);
  return response.data;
};

export const updateRol = async (id, data) => {
  const response = await axiosInstance.put(`/roles/${id}`, data);
  return response.data;
};

export const deleteRol = async (id) => {
  const response = await axiosInstance.delete(`/roles/${id}`);
  return response.data;
};