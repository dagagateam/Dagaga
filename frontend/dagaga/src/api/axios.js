import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1', // .env에 없으면 기본값 /api/v1 사용
    headers: {
        'Content-Type': 'application/json',
    },
});

export default instance;