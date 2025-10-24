import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://192.168.2.11/shopify-manager/",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default axiosInstance;
