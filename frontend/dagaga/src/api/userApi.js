// src/api/userApi.js
import instance from './axios';

export const loginAPI = async (email, password) => {
    // [나중에 백엔드 연결 시 주석 해제]
    // const response = await instance.post('/users/login', { email, password });
    // return response.data;

    // [현재: 명세서 기반 Mocking]
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                message: "로그인에 성공했습니다.",
                data: {
                    accessToken: "JWT_ACCESS_TOKEN_EXAMPLE",
                    tokenType: "Bearer",
                    expiresIn: 3600,
                    user: {
                        userId: 5,
                        email: email, // 입력받은 이메일 반영
                        nickname: "테스트계정",
                        viewLanguage: "ko",
                        nativeLanguage: "zh",
                        region: 1111000000
                    }
                }
            });
        }, 500);
    });
};