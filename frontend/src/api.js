import axios from "axios";
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";
export default axios.create({ baseURL: API_BASE, timeout: 15000 });
