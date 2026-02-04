import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import { getUserMeAPI } from '../../api/userApi';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, setAccessToken } = useUserStore();

    useEffect(() => {
        const handleAuth = async () => {
            const accessToken = searchParams.get('accessToken');
            const refreshToken = searchParams.get('refreshToken');

            if (accessToken) {
                // 1. 토큰 먼저 저장 (refreshToken은 쿠키에 있을 수 있음)
                setAccessToken(accessToken);

                try {
                    // 2. 사용자 정보 조회
                    const userInfo = await getUserMeAPI();

                    // 3. 스토어에 로그인 정보 통합 저장
                    login({
                        ...userInfo,
                        accessToken,
                        refreshToken: refreshToken || null
                    });

                    // 4. 메인 페이지로 이동
                    navigate('/Homepage');
                } catch (error) {
                    console.error('Failed to fetch user info after social login:', error);
                    navigate('/login?error=auth_failed');
                }
            } else {
                console.error('Missing accessToken in OAuth redirect');
                navigate('/login?error=missing_tokens');
            }
        };

        handleAuth();
    }, [searchParams, navigate, login, setAccessToken]);

    return (
        <div className="auth-success-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            backgroundColor: '#f8f9fa'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center' }}
            >
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem', marginBottom: '1.5rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h4 style={{ color: '#333', fontWeight: '500' }}>로그인 중입니다...</h4>
                <p style={{ color: '#666' }}>잠시만 기다려주세요.</p>
            </motion.div>
        </div>
    );
};

export default AuthSuccess;
