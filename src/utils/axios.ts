import axios from 'axios';

export const axiosApiBackendInstance = axios.create({
  baseURL: process.env.BACKEND_URL,
});
