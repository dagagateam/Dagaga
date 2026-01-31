// src/api/userApi.js
import instance from './axios';

export const loginAPI = async (email, password) => {
    try {
        // [백엔드 연결] 실제 API 호출
        const response = await instance.post('/users/login', { email, password });

        // 백엔드 응답: 현재 userId(Int)만 반환됨
        // 프론트엔드에서 바로 이 값을 사용하도록 수정
        return response.data; 
    } catch (error) {
        console.error("Login API Error:", error);
        throw error;
    }
};

export const signupAPI = async (userData) => {
    try {
        // [백엔드 연결] 실제 회원가입 API 호출
        const response = await instance.post('/users/signup', userData);
        
        // 백엔드 응답: userId(Int)만 반환됨
        return response.data;
    } catch (error) {
        console.error("Signup API Error:", error);
        throw error;
    }
};

export const checkEmailAPI = async (email) => {
    try {
        // [백엔드 연결] 이메일 중복 확인 API 호출
        await instance.post('/users/check-email', null, {
            params: { email }
        });
        
        // 200 OK 응답 = 사용 가능한 이메일
        return true;
    } catch (error) {
        // 400 에러 = 이미 존재하는 이메일
        if (error.response && error.response.status === 400) {
            return false;
        }
        // 그 외 에러는 다시 throw
        console.error("Check Email API Error:", error);
        throw error;
    }
};

export const checkNicknameAPI = async (nickname) => {
    // [나중에 백엔드 연결 시]
    // return await instance.get(`/users/check-nickname?nickname=${nickname}`);

    // Mocking: '중복닉네임'은 이미 존재한다고 가정
    return new Promise((resolve) => {
        setTimeout(() => {
            if (nickname === '중복닉네임') {
                resolve(false);
            } else {
                resolve(true);
            }
        }, 300);
    });
};