import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginAPI } from '../../api/userApi';

import { InputGroup } from 'react-bootstrap';
import './Login.css';
import LanguageSelector from '../../components/auth/LanguageSelector';
import SocialButton from '../../components/auth/SocialButton';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PasswordToggleButton from '../../components/common/PasswordToggleButton';
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
    const [showPassword, setShowPassword] = useState(false);
    const [isFindPasswordModalOpen, setIsFindPasswordModalOpen] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        try {
            // 0. 비밀번호 복잡성 검사 (프론트엔드 유효성 검사)
            // 영문, 숫자, 특수문자(*, +, -) 포함 8자 이상
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[*+-])[A-Za-z\d*+-]{8,}$/;
            if (!passwordRegex.test(password)) {
                setLoginError(t('password_error_requirements') || "비밀번호는 영문, 숫자, 특수문자(*, +, -)를 포함하여 8자 이상이어야 합니다.");
                return;
            }

            // 1. API 호출 - AuthResponse 반환
            const authResponse = await loginAPI(email, password);

            // DEBUG: 콘솔 로그
            // console.log('✅ 로그인 성공:', authResponse);

            // 2. Store에 AuthResponse 저장 (토큰 + 사용자 정보)
            login(authResponse);

            // 3. 홈페이지로 이동
            navigate('/Homepage');
        } catch (error) {
            console.error('Login failed:', error);

            // 에러 메시지 처리
            if (error.response?.status === 401) {
                setLoginError(t('login_failed_creds'));
            } else if (error.response?.data?.message) {
                setLoginError(error.response.data.message);
            } else {
                setLoginError(t('login_error'));
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
            <main className="login-content">
                <div className="login-wrapper">
                    <div className="login-card">
                        <div className="login-form-section">
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
                                    <InputGroup>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder={t('password_placeholder')}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (loginError) setLoginError('');
                                            }}
                                            className="form-control rounded-end-0 border-end-0"
                                        />
                                        <PasswordToggleButton
                                            showPassword={showPassword}
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="bg-white border rounded-end-3 border-start-0"
                                        />
                                    </InputGroup>
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