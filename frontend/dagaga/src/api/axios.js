import axios from 'axios';
import { useUserStore } from '../store/userStore';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // 쿠키 전송 허용
});

// Request Interceptor: 자동으로 JWT 토큰 첨부
instance.interceptors.request.use(
    (config) => {
        const { accessToken } = useUserStore.getState();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: 401 에러 처리 및 토큰 갱신
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { setAccessToken, logout } = useUserStore.getState();

                // Refresh token은 쿠키로 전송됨
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || '/api/v1'}/users/refresh`,
                    null,
                    { withCredentials: true }
                );

                const { accessToken: newAccessToken } = response.data;

                // 새 토큰 저장
                setAccessToken(newAccessToken);

                // 원래 요청에 새 토큰 적용
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // 원래 요청 재시도
                return instance(originalRequest);
            } catch (refreshError) {
                const { logout } = useUserStore.getState();
                logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default instance;