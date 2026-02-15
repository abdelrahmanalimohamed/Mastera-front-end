export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUserRole = () => {
  return localStorage.getItem("role"); // we will store it on login
};

export const isAuthenticated = () => {
  return !!getToken();
};
