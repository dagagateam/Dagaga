import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { signupAPI, checkEmailAPI, checkNicknameAPI } from '../../api/userApi';
import './Signup.css';
import loginTiger from '../../assets/characters/login_tiger.png';
import logo from '../../assets/icons/logo.png';
import { area0, allAreas } from '../../data/regionData';
import LanguageSelector from '../../components/auth/LanguageSelector';

const Signup = () => {
    const navigate = useNavigate();
    const [language, setLanguage] = useState('한국어');

    // Form States
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        nativeLanguage: '중국어',
        sido: area0[0],
        gugun: '구/군 선택',
        arrivalDate: ''
    });

    const [gugunList, setGugunList] = useState([]);
    const [errors, setErrors] = useState({});
    
    // Nickname Verification State
    const [nicknameMessage, setNicknameMessage] = useState('');
    const [isNicknameAvailable, setIsNicknameAvailable] = useState(null); // null, true, false

    // Handle Region Change (Bootstrap Dropdown)
    const handleSidoSelect = (eventKey) => {
        const selectedSido = eventKey;
        const index = area0.indexOf(selectedSido);

        setFormData({
            ...formData,
            sido: selectedSido,
            gugun: '구/군 선택' // Reset gugun
        });

        if (index > 0 && allAreas[index]) {
            setGugunList(allAreas[index]);
        } else {
            setGugunList([]);
        }
    };

    const handleGugunSelect = (eventKey) => {
        setFormData({
            ...formData,
            gugun: eventKey
        });
    };

    // Handle Nickname Check
    const handleCheckNickname = async () => {
        const { nickname } = formData;
        const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;

        if (!nickname) {
            setErrors({...errors, nickname: "닉네임을 입력해주세요."});
            return;
        }

        if (!nicknameRegex.test(nickname)) {
            setErrors({...errors, nickname: "닉네임은 특수문자 제외 2~10자여야 합니다."});
            return;
        }

        const isAvailable = await checkNicknameAPI(nickname);
        setIsNicknameAvailable(isAvailable);
        
        if (isAvailable) {
            setNicknameMessage("사용 가능한 닉네임입니다.");
            setErrors({...errors, nickname: ''});
        } else {
            setNicknameMessage("이미 사용 중인 닉네임입니다.");
            // setErrors({...errors, nickname: "이미 사용 중인 닉네임입니다."}); // Optional: Mirror as error
        }
    };

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Reset verification on change
        if (name === 'nickname') {
            setIsNicknameAvailable(null);
            setNicknameMessage('');
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    // Validation Logic
    const validate = async () => {
        const newErrors = {};
        const { email, password, confirmPassword } = formData;

        // 1. Password Validation
        // 영문, 숫자, 특수문자(*, +, -) 포함 8자 이상
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[*+-])[A-Za-z\d*+-]{8,}$/;
        if (!passwordRegex.test(password)) {
            newErrors.password = "비밀번호는 영문, 숫자, 특수문자(*, +, -)를 포함하여 8자 이상이어야 합니다.";
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        }

        // 2. Nickname Validation (Client-side format check only here, duplicates checked via button)
        if (isNicknameAvailable === false) {
             newErrors.nickname = "이미 사용 중인 닉네임입니다.";
        } else if (isNicknameAvailable === null && formData.nickname) {
             newErrors.nickname = "닉네임 중복 확인을 해주세요.";
        }

        // 3. Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            newErrors.email = "유효한 이메일 형식이 아닙니다.";
        }

        // 4. Duplicate Checks (API Call)
        // 실제로는 입력 시점(onBlur 등)에 체크하는 것이 좋지만 여기서는 가입 시점에 체크
        if (!newErrors.email) {
            const isEmailAvailable = await checkEmailAPI(email);
            if (!isEmailAvailable) newErrors.email = "이미 사용 중인 이메일입니다.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        // Validate
        const isValid = await validate();
        if (!isValid) return;

        try {
            // API Call Construction
            const requestData = {
                email: formData.email,
                password: formData.password,
                nickname: formData.nickname || formData.email.split('@')[0], // 닉네임 미입력시 이메일 앞부분
                viewLanguage: language === '한국어' ? 'ko' : (language === '중국어' ? 'zh' : 'vi'),
                nativeLanguage: formData.nativeLanguage === '한국어' ? 'ko' : (formData.nativeLanguage === '중국어' ? 'zh' : 'vi'),
                region: 1111000000, // Mocking: 서울특별시 중구 명동 코드
                entryDate: formData.arrivalDate || null
            };

            const response = await signupAPI(requestData);

            alert(response.message);
            navigate('/login');

        } catch (error) {
            console.error("Signup failed:", error);
            alert("회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="signup-container">
            <header className="signup-header">
                <div className="logo-area">
                    <img src={logo} alt="Dagaga Logo" style={{ height: '40px' }} />
                </div>

                <LanguageSelector language={language} setLanguage={setLanguage} />
            </header>


            <main className="signup-content">
                <div className="signup-wrapper">
                    <div className="signup-card">
                        <div className="signup-left-section">
                            <h2>회원가입</h2>

                            <form onSubmit={handleSignup} className="signup-form">
                                <div className="form-row">
                                    <div className="input-group half">
                                        <label>이메일 <span>*</span></label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="example@email.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className={errors.email ? 'error-input' : ''}
                                        />
                                        {errors.email && <span className="error-msg">{errors.email}</span>}
                                    </div>
                                    <div className="input-group half">
                                        <label>화면 표시 언어 <span>*</span></label>
                                        <Dropdown className="region-dropdown" onSelect={(e) => setLanguage(e)}>
                                            <Dropdown.Toggle variant="light" className="region-toggle">
                                                {language}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="region-menu">
                                                {['한국어', '중국어', '베트남어'].map((lang) => (
                                                    <Dropdown.Item eventKey={lang} key={lang}>{lang}</Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="input-group half">
                                        <label>닉네임</label>
                                        <div className="nickname-group">
                                            <input
                                                type="text"
                                                name="nickname"
                                                placeholder="닉네임을 입력하세요"
                                                value={formData.nickname}
                                                onChange={handleChange}
                                                className={errors.nickname ? 'error-input' : ''}
                                            />
                                            <button type="button" className="check-btn" onClick={handleCheckNickname}>
                                                중복 확인
                                            </button>
                                        </div>
                                        {/* 우선순위: 에러 메시지 > 성공/실패 메시지 */}
                                        {errors.nickname ? (
                                            <span className="error-msg">{errors.nickname}</span>
                                        ) : (
                                            nicknameMessage && <span className={`validation-msg ${isNicknameAvailable ? 'success' : 'error'}`}>{nicknameMessage}</span>
                                        )}
                                    </div>
                                    <div className="input-group half">
                                        <label>모국어 <span>*</span></label>
                                        <Dropdown className="region-dropdown" onSelect={(e) => setFormData({...formData, nativeLanguage: e})}>
                                            <Dropdown.Toggle variant="light" className="region-toggle">
                                                {formData.nativeLanguage}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="region-menu">
                                                {['한국어', '중국어', '베트남어'].map((lang) => (
                                                    <Dropdown.Item eventKey={lang} key={lang}>{lang}</Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="input-group half">
                                        <label>비밀번호 <span>*</span></label>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="비밀번호를 입력하세요"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className={errors.password ? 'error-input' : ''}
                                        />
                                        {errors.password && <span className="error-msg">{errors.password}</span>}
                                    </div>
                                    <div className="input-group half">
                                        <label>지역 <span>*</span></label>
                                        <div className="region-selects">
                                            <Dropdown className="region-dropdown" onSelect={handleSidoSelect}>
                                                <Dropdown.Toggle variant="light" className="region-toggle">
                                                    {formData.sido}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="region-menu">
                                                    {area0.map((area) => (
                                                        <Dropdown.Item eventKey={area} key={area}>{area}</Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>

                                            <Dropdown className="region-dropdown" onSelect={handleGugunSelect}>
                                                <Dropdown.Toggle variant="light" className="region-toggle">
                                                    {formData.gugun}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="region-menu">
                                                    {gugunList.length > 0 ? (
                                                        gugunList.map((area) => (
                                                            area !== '구/군 선택' && <Dropdown.Item eventKey={area} key={area}>{area}</Dropdown.Item>
                                                        ))
                                                    ) : (
                                                        <Dropdown.Item disabled>구/군 선택</Dropdown.Item>
                                                    )}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="input-group half">
                                        <label>비밀번호 확인 <span>*</span></label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="비밀번호를 입력하세요"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className={errors.confirmPassword ? 'error-input' : ''}
                                        />
                                        {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
                                    </div>
                                    <div className="input-group half">
                                        <label>한국에 온 날짜</label>
                                        <input
                                            type="date"
                                            name="arrivalDate"
                                            value={formData.arrivalDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="signup-action">
                                    <button type="submit" className="signup-btn">가입하기</button>
                                </div>
                            </form>

                            <div className="login-link">
                                계정이 있으신가요? <span onClick={() => navigate('/login')}>로그인</span>
                            </div>
                        </div>

                    </div>

                    <img src={loginTiger} alt="Welcome Tiger" className="tiger-image" />
                </div>
            </main>
        </div>
    );
};

export default Signup;
