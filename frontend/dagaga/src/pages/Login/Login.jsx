import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginAPI } from '../../api/userApi';
import './Login.css';
import loginTiger from '../../assets/characters/login_tiger.png';
import logo from '../../assets/icons/logo.png';
import LanguageSelector from '../../components/auth/LanguageSelector';
import SocialButton from '../../components/auth/SocialButton';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import FindPasswordModal from '../../components/auth/FindPasswordModal';

import { useUserStore } from '../../store/userStore';

import { motion } from 'framer-motion';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const login = useUserStore((state) => state.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isFindPasswordModalOpen, setIsFindPasswordModalOpen] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        try {
            // 1. API 호출 - AuthResponse 반환
            const authResponse = await loginAPI(email, password);

            // DEBUG: 콘솔 로그
            // console.log('✅ Login successful:', authResponse);

            // 2. Store에 AuthResponse 저장 (토큰 + 사용자 정보)
            login(authResponse);

            // 3. 홈페이지로 이동
            navigate('/Homepage');
        } catch (error) {
            console.error('Login failed:', error);

            // 에러 메시지 처리
            if (error.response?.status === 401) {
                setLoginError("이메일 또는 비밀번호가 잘못 되었습니다.");
            } else if (error.response?.data?.message) {
                setLoginError(error.response.data.message);
            } else {
                setLoginError("로그인 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <motion.div
            className="login-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
            <header className="login-header">
                <div className="logo-area" onClick={() => navigate('/Homepage')} style={{ cursor: 'pointer' }}>
                    <img src={logo} alt="Dagaga Logo" style={{ height: '40px' }} />
                </div>

                <LanguageSelector />
            </header>

            <main className="login-content">
                <div className="login-wrapper">
                    <div className="login-card">
                        <div className="login-left-section">
                            <h2>{t('login')}</h2>

                            <form onSubmit={handleLogin}>
                                <div className="custom-input-group">
                                    <label>{t('email')}</label>
                                    <Input
                                        type="text"
                                        placeholder={t('email_placeholder')}
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (loginError) setLoginError('');
                                        }}
                                    />
                                </div>

                                <div className="custom-input-group">
                                    <label>{t('password')}</label>
                                    <Input
                                        type="password"
                                        placeholder={t('password_placeholder')}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (loginError) setLoginError('');
                                        }}
                                    />
                                </div>

                                {loginError && (
                                    <div className="login-error-message">
                                        {loginError}
                                    </div>
                                )}

                                <div className="forgot-password">
                                    <Button
                                        type="button"
                                        className="text-btn"
                                        onClick={() => setIsFindPasswordModalOpen(true)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#666',
                                            textDecoration: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {t('forgot_password')}
                                    </Button>
                                </div>

                                <Button type="submit" className="login-btn">{t('login')}</Button>
                            </form>

                            <div className="signup-link">
                                {t('no_account')} <span onClick={() => navigate('/Signup')} style={{ cursor: 'pointer', color: '#0066cc', fontWeight: 'bold' }}>{t('signup')}</span>
                            </div>

                            <div className="divider">
                                <span>{t('or_divider')}</span>
                            </div>

                            <div className="social-login">
                                <SocialButton
                                    provider="google"
                                    onClick={() => window.location.href = `/oauth2/authorization/google`}
                                >
                                    {t('google_login')}
                                </SocialButton>
                                {/* <SocialButton provider="line">
                                    {t('line_login')}
                                </SocialButton> */}
                            </div>
                        </div>

                        <div className="login-right-section">
                            <img src={loginTiger} alt="Welcome Tiger" className="login-tiger-image" />
                            <div className="welcome-text">
                                <h1 style={{ whiteSpace: 'pre-line' }}>{t('welcome_title')}</h1>
                                <p>{t('welcome_subtitle')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <FindPasswordModal
                isOpen={isFindPasswordModalOpen}
                onClose={() => setIsFindPasswordModalOpen(false)}
            />
        </motion.div>
    );
};

export default Login;