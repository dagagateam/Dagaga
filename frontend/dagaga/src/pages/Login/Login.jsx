import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../../api/userApi';
import './Login.css';
import loginTiger from '../../assets/characters/login_tiger.png';
import logo from '../../assets/icons/logo.png';
import googleIcon from '../../assets/icons/google.png';
import lineIcon from '../../assets/icons/line.png';
import LanguageSelector from '../../components/auth/LanguageSelector';

const Login = () => {
    const navigate = useNavigate();
    const [language, setLanguage] = useState('한국어');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // 1. API 호출
            const response = await loginAPI(email, password);

            // Mocking 응답 구조에 맞게 처리 (response.data.accessToken)
            if (response.data && response.data.accessToken) {
                // 2. 성공 시 토큰과 사용자 정보 저장
                // TODO: 보안 강화를 위해 HttpOnly 쿠키 방식으로 accessToken 저장 로직 변경 필요
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('nickname', response.data.user.nickname);
                localStorage.setItem('regionName', response.data.user.regionName);

                alert(response.message || "로그인에 성공했습니다.");

                // 3. 메인 페이지로 이동
                navigate('/scenario-select');
            } else {
                // 실제 백엔드 연동 시 응답 구조에 따라 달라질 수 있음
                console.log('Login success but unhandled response structure:', response);
                navigate('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
        }
    };

    return (
        <div className="login-container">
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
                                <div className="input-group">
                                    <label>이메일</label>
                                    <input
                                        type="text"
                                        placeholder="이메일을 입력하세요"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>비밀번호</label>
                                    <input
                                        type="password"
                                        placeholder="비밀번호를 입력하세요"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <div className="forgot-password">
                                    <a href="#">아이디, 비밀번호를 잊으셨나요?</a>
                                </div>

                                <button type="submit" className="login-btn">로그인</button>
                            </form>

                            <div className="signup-link">
                                아직 계정이 없으신가요? <span onClick={() => navigate('/signup')} style={{ cursor: 'pointer', color: '#0066cc', fontWeight: 'bold' }}>회원가입</span>
                            </div>

                            <div className="divider">
                                <span>또는</span>
                            </div>

                            <div className="social-login">
                                <button className="social-btn google">
                                    <img src={googleIcon} alt="Google" />
                                    Google로 계속하기
                                </button>
                                <button className="social-btn line">
                                    <img src={lineIcon} alt="Line" />
                                    Line으로 계속하기
                                </button>
                            </div>
                        </div>

                        <div className="login-right-section">
                            <div className="welcome-text">
                                <h1>한국 생활이<br /> 많이 어려우신가요?</h1>
                                <p>다가가와 함께라면 더 쉽게!</p>
                            </div>
                        </div>
                    </div>

                    <img src={loginTiger} alt="Welcome Tiger" className="tiger-image" />
                </div>
            </main>
        </div>
    );
};

export default Login;