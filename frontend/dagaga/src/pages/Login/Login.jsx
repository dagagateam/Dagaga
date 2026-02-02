import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../../api/userApi';
import './Login.css';
import loginTiger from '../../assets/characters/login_tiger.png';
import logo from '../../assets/icons/logo.png';
import LanguageSelector from '../../components/auth/LanguageSelector';
import SocialButton from '../../components/auth/SocialButton';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

import { useUserStore } from '../../store/userStore';

import { motion } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const login = useUserStore((state) => state.login);
    const [language, setLanguage] = useState('한국어');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        try {
            // 1. API 호출 - AuthResponse 반환
            const authResponse = await loginAPI(email, password);

            console.log('✅ Login successful:', authResponse);

            // 2. Store에 AuthResponse 저장 (토큰 + 사용자 정보)
            login(authResponse);

            // 3. 메인 페이지로 이동
            navigate('/ScenarioSelect');
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
                <div className="logo-area">
                    <img src={logo} alt="Dagaga Logo" style={{ height: '40px' }} />
                </div>

                <LanguageSelector language={language} setLanguage={setLanguage} />
            </header>

            <main className="login-content">
                <div className="login-wrapper">
                    <div className="login-card">
                        <div className="login-left-section">
                            <h2>로그인</h2>

                            <form onSubmit={handleLogin}>
                                <div className="custom-input-group">
                                    <label>이메일</label>
                                    <Input
                                        type="text"
                                        placeholder="이메일을 입력하세요"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (loginError) setLoginError('');
                                        }}
                                    />
                                </div>

                                <div className="custom-input-group">
                                    <label>비밀번호</label>
                                    <Input
                                        type="password"
                                        placeholder="비밀번호를 입력하세요"
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
                                    <a href="#">아이디, 비밀번호를 잊으셨나요?</a>
                                </div>

                                <Button type="submit" className="login-btn">로그인</Button>
                            </form>

                            <div className="signup-link">
                                아직 계정이 없으신가요? <span onClick={() => navigate('/Signup')} style={{ cursor: 'pointer', color: '#0066cc', fontWeight: 'bold' }}>회원가입</span>
                            </div>

                            <div className="divider">
                                <span>또는</span>
                            </div>

                            <div className="social-login">
                                <SocialButton provider="google">
                                    Google로 계속하기
                                </SocialButton>
                                <SocialButton provider="line">
                                    Line으로 계속하기
                                </SocialButton>
                            </div>
                        </div>

                        <div className="login-right-section">
                            <img src={loginTiger} alt="Welcome Tiger" className="login-tiger-image" />
                            <div className="welcome-text">
                                <h1>한국 생활이<br /> 많이 어려우신가요?</h1>
                                <p>다가가와 함께라면 더 쉽게!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};

export default Login;