import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { signupAPI, checkEmailAPI, checkNicknameAPI } from '../../api/userApi';
import './Signup.css';
import loginTiger from '../../assets/characters/login_tiger.png';
import logo from '../../assets/icons/logo.png';
import { area0, allAreas, getLocationId } from '../../data/regionData';
import LanguageSelector from '../../components/Auth/LanguageSelector';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import RegionSelect from '../../components/Common/RegionSelect';
import Select from '../../components/Common/Select';
import ArrivalDateInput from '../../components/Common/ArrivalDateInput';

import { motion } from 'framer-motion';

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
        sido: '시/도 선택',
        gugun: '구/군 선택',
        arrivalDate: ''
    });

    const [errors, setErrors] = useState({});
    
    // Email Verification State
    const [emailMessage, setEmailMessage] = useState('');
    const [isEmailAvailable, setIsEmailAvailable] = useState(null); // null, true, false
    
    // Nickname Verification State
    const [nicknameMessage, setNicknameMessage] = useState('');
    const [isNicknameAvailable, setIsNicknameAvailable] = useState(null); // null, true, false

    // Password Match State
    const [passwordMatchMessage, setPasswordMatchMessage] = useState('');
    const [isPasswordMatch, setIsPasswordMatch] = useState(null); // null, true, false

    // Region Handlers
    const handleSidoChange = (selectedSido) => {
        setFormData({
            ...formData,
            sido: selectedSido,
            gugun: '구/군 선택' // Reset gugun
        });
    };

    const handleGugunChange = (selectedGugun) => {
        setFormData({
            ...formData,
            gugun: selectedGugun
        });
    };

    // Handle Email Check
    const handleCheckEmail = async () => {
        const { email } = formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            setErrors({...errors, email: "이메일을 입력해주세요."});
            return;
        }

        if (!emailRegex.test(email)) {
            setErrors({...errors, email: "올바른 이메일 형식이 아닙니다."});
            return;
        }

        try {
            const isAvailable = await checkEmailAPI(email);
            setIsEmailAvailable(isAvailable);
            
            if (isAvailable) {
                setEmailMessage("사용 가능한 이메일입니다.");
                setErrors({...errors, email: ''});
            } else {
                setEmailMessage("이미 사용 중인 이메일입니다.");
            }
        } catch (error) {
            setEmailMessage("이메일 확인 중 오류가 발생했습니다.");
            setIsEmailAvailable(false);
        }
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
        if (name === 'email') {
            setIsEmailAvailable(null);
            setEmailMessage('');
        }
        if (name === 'nickname') {
            setIsNicknameAvailable(null);
            setNicknameMessage('');
        }

        // Check password match in real-time
        if (name === 'password' || name === 'confirmPassword') {
            const newPassword = name === 'password' ? value : formData.password;
            const newConfirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;

            if (newConfirmPassword) {
                if (newPassword === newConfirmPassword) {
                    setPasswordMatchMessage('비밀번호가 일치합니다.');
                    setIsPasswordMatch(true);
                } else {
                    setPasswordMatchMessage('비밀번호가 일치하지 않습니다.');
                    setIsPasswordMatch(false);
                }
            } else {
                setPasswordMatchMessage('');
                setIsPasswordMatch(null);
            }
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
            // 선택된 지역을 location_id로 변환
            const locationId = getLocationId(formData.sido, formData.gugun);
            
            // API Call Construction
            const requestData = {
                email: formData.email,
                password: formData.password,
                nickname: formData.nickname || formData.email.split('@')[0], // 닉네임 미입력시 이메일 앞부분
                viewLangCode: language === '한국어' ? 'ko' : (language === '중국어' ? 'zh' : 'vi'),
                nativeLangCode: formData.nativeLanguage === '한국어' ? 'ko' : (formData.nativeLanguage === '중국어' ? 'zh' : 'vi'),
                locationId: locationId, // 선택된 지역의 location_id
                arrivalDate: formData.arrivalDate || null
            };

            console.log("🔍 회원가입 요청 데이터:", requestData);

            const response = await signupAPI(requestData);

            console.log("✅ 회원가입 성공! 응답:", response);
            alert("회원가입에 성공했습니다!");
            navigate('/login');

        } catch (error) {
            console.error("Signup failed:", error);
            alert("회원가입 중 오류가 발생했습니다.");
        }
    };

    return (
        <motion.div 
            className="signup-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
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
                                    <div className="custom-input-group half">
                                        <label>이메일 <span>*</span></label>
                                        <div className="nickname-group">
                                            <Input
                                                type="email"
                                                name="email"
                                                placeholder="example@email.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className={errors.email ? 'error-input' : ''}
                                            />
                                            <button type="button" className="check-btn" onClick={handleCheckEmail}>
                                                중복 확인
                                            </button>
                                        </div>
                                        {/* 우선순위: 에러 메시지 > 성공/실패 메시지 */}
                                        {errors.email ? (
                                            <span className="error-msg">{errors.email}</span>
                                        ) : (
                                            emailMessage && <span className={`validation-msg ${isEmailAvailable ? 'success' : 'error'}`}>{emailMessage}</span>
                                        )}
                                    </div>
                                    <div className="custom-input-group half">
                                        <label>화면 표시 언어 <span>*</span></label>
                                        <Select
                                            value={language}
                                            options={['한국어', '중국어', '베트남어']}
                                            onChange={(val) => setLanguage(val)}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="custom-input-group half">
                                        <label>닉네임</label>
                                        <div className="nickname-group">
                                            <Input
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
                                    <div className="custom-input-group half">
                                        <label>모국어 <span>*</span></label>
                                        <Select
                                            value={formData.nativeLanguage}
                                            options={['한국어', '중국어', '베트남어']}
                                            onChange={(val) => setFormData({ ...formData, nativeLanguage: val })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="custom-input-group half">
                                        <label>비밀번호 <span>*</span></label>
                                        <Input
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
                                    <div className="custom-input-group half">
                                        <label>지역 <span>*</span></label>
                                        <div className="region-selects">
                                            <RegionSelect
                                                sido={formData.sido}
                                                gugun={formData.gugun}
                                                onSidoChange={handleSidoChange}
                                                onGugunChange={handleGugunChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="custom-input-group half">
                                        <label>비밀번호 확인 <span>*</span></label>
                                        <Input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="비밀번호를 입력하세요"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className={errors.confirmPassword ? 'error-input' : ''}
                                        />
                                        {/* 우선순위: 에러 메시지 > 일치 여부 메시지 */}
                                        {errors.confirmPassword ? (
                                            <span className="error-msg">{errors.confirmPassword}</span>
                                        ) : (
                                            passwordMatchMessage && <span className={`validation-msg ${isPasswordMatch ? 'success' : 'error'}`}>{passwordMatchMessage}</span>
                                        )}
                                    </div>
                                    <div className="custom-input-group half">
                                        <ArrivalDateInput
                                            value={formData.arrivalDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="signup-action">
                                    <Button type="submit" className="signup-btn">가입하기</Button>
                                </div>
                            </form>

                            <div className="login-link">
                                계정이 있으신가요? <span onClick={() => navigate('/login')}>로그인</span>
                            </div>
                        </div>

                    </div>

                    <img src={loginTiger} alt="Welcome Tiger" className="signup-tiger-image" />
                </div>
            </main>
        </motion.div>
    );
};

export default Signup;
