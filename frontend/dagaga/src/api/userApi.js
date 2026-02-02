// src/api/userApi.js
import instance from './axios';

export const loginAPI = async (email, password) => {
    try {
        // [백엔드 연결] 실제 API 호출
        const response = await instance.post('/users/login', { email, password });

        // 백엔드 응답: AuthResponse 객체 반환
        // { accessToken, refreshToken, tokenType, expiresIn, userId, email, locationId, viewLangCode, nativeLangCode }
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
    try {
        // [백엔드 연결] 닉네임 중복 확인 API 호출
        await instance.post('/users/check-nickname', null, {
            params: { nickname }
        });
        
        // 200 OK 응답 = 사용 가능한 닉네임
        return true;
    } catch (error) {
        // 400 에러 = 이미 존재하는 닉네임
        if (error.response && error.response.status === 400) {
            return false;
        }
        // 그 외 에러는 다시 throw
        console.error("Check Nickname API Error:", error);
        throw error;
    }
};

// 로그아웃 API
export const logoutAPI = async () => {
    try {
        // [백엔드 연결] 로그아웃 API 호출
        // Authorization 헤더는 axios 인터셉터에서 자동으로 추가됨
        await instance.post('/users/logout');
        
        return true;
    } catch (error) {
        console.error("Logout API Error:", error);
        throw error;
    }
};
