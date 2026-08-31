import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    withCredentials: true, // 쿠키를 포함한 요청을 보내기 위해 설정
});

axiosInstance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})
export default axiosInstance; 