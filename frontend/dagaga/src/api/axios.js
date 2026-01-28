import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // .env에 적은 주소를 가져옴
    headers: {
        'Content-Type': 'application/json',
    },
});

export default instance;