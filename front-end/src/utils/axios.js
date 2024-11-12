import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

const axiosInstance = axios.create({ baseURL, timeout: 30000 });

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default axiosInstance;
