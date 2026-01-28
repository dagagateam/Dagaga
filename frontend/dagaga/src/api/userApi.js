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

export const signupAPI = async (userData) => {
    // [나중에 백엔드 연결 시]
    // const response = await instance.post('/users/signup', userData);
    // return response.data;

    console.log("Signup Request Data:", userData);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                message: "회원가입에 성공했습니다.",
                data: {
                    userId: 5,
                    email: userData.email,
                    description: "안녕하세요",
                    nickname: userData.nickname,
                    createAt: new Date().toISOString(),
                    modifiedAt: new Date().toISOString()
                }
            });
        }, 500);
    });
};

export const checkEmailAPI = async (email) => {
    // [나중에 백엔드 연결 시]
    // return await instance.get(`/users/check-email?email=${email}`);

    // Mocking: 'exist@email.com'은 이미 존재한다고 가정
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === 'exist@email.com') {
                // API 에러 구조에 따라 달라질 수 있음, 여기선 false 리턴 혹은 에러 throw
                resolve(false); // 중복됨
            } else {
                resolve(true); // 사용 가능
            }
        }, 300);
    });
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