import axios from 'axios';
import { useUserStore } from '../store/userStore';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: 자동으로 JWT 토큰 첨부
instance.interceptors.request.use(
    (config) => {
        // Zustand store에서 accessToken 가져오기
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

        // 401 Unauthorized 에러이고, 재시도하지 않은 요청인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { refreshToken, setTokens, logout } = useUserStore.getState();

                if (!refreshToken) {
                    // Refresh token이 없으면 로그아웃
                    logout();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Refresh token으로 새 access token 발급
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || '/api/v1'}/users/refresh`,
                    { refreshToken }
                );

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                // 새 토큰 저장
                setTokens(newAccessToken, newRefreshToken);

                // 원래 요청에 새 토큰 적용
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // 원래 요청 재시도
                return instance(originalRequest);
            } catch (refreshError) {
                // Refresh token도 만료되었으면 로그아웃
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