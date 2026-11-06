import axiosInstance from './axiosInstance';

// Login
export const loginUser = async ({ NomUsu, Pas }) => {
  console.log( NomUsu, Pas)
  const response = await axiosInstance.post('/auth/login', { NomUsu, Pas });
  return response.data; // { token, user, menu }
};

// Logout
export const logoutUser = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('menu');
  return null;
};

//Menu
export const fetchMenu = async () => {
  const response = await axiosInstance.get('/menu');
  return response.data;
};