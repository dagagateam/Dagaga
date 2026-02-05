import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';
import { signupAPI, checkEmailAPI, checkNicknameAPI, requestVerificationAPI, confirmVerificationAPI } from '../../api/userApi';
import './Signup.css';
import { area0, allAreas, getLocationId } from '../../data/regionData';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import RegionSelect from '../../components/common/RegionSelect';
import Select from '../../components/common/Select';
import ArrivalDateInput from '../../components/common/ArrivalDateInput';

import { motion } from 'framer-motion';

const Signup = () => {
    const { t } = useTranslation();
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
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [verificationTicker, setVerificationTicker] = useState(null);

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

    // Handle Email Verification Request
    const handleRequestVerification = async () => {
        const { email } = formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            setErrors({ ...errors, email: "이메일을 입력해주세요." });
            return;
        }

        if (!emailRegex.test(email)) {
            setErrors({ ...errors, email: "올바른 이메일 형식이 아닙니다." });
            return;
        }

        try {
            // 1. Check Duplicate first
            const isAvailable = await checkEmailAPI(email);
            setIsEmailAvailable(isAvailable);

            if (!isAvailable) {
                setEmailMessage("이미 사용 중인 이메일입니다.");
                return;
            }

            // 2. Request Verification Code
            await requestVerificationAPI(email);
            setEmailMessage("인증 코드가 전송되었습니다. 이메일을 확인해주세요.");
            setShowVerificationInput(true);
            setErrors({ ...errors, email: '' });

        } catch (error) {
            setEmailMessage("인증 메일 전송 중 오류가 발생했습니다.");
            setIsEmailAvailable(false);
        }
    };

    const handleConfirmVerification = async () => {
        if (!verificationCode) {
            alert("인증 코드를 입력해주세요.");
            return;
        }

        try {
            await confirmVerificationAPI(formData.email, verificationCode);
            setIsEmailVerified(true);
            setShowVerificationInput(false);
            setEmailMessage("이메일 인증이 완료되었습니다.");
        } catch (error) {
            alert("인증 코드가 올바르지 않습니다.");
        }
    };

    // Handle Nickname Check
    const handleCheckNickname = async () => {
        const { nickname } = formData;
        const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;

        if (!nickname) {
            setErrors({ ...errors, nickname: "닉네임을 입력해주세요." });
            return;
        }

        if (!nicknameRegex.test(nickname)) {
            setErrors({ ...errors, nickname: "닉네임은 특수문자 제외 2~10자여야 합니다." });
            return;
        }

        const isAvailable = await checkNicknameAPI(nickname);
        setIsNicknameAvailable(isAvailable);

        if (isAvailable) {
            setNicknameMessage("사용 가능한 닉네임입니다.");
            setErrors({ ...errors, nickname: '' });
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
            setIsEmailVerified(false);
            setShowVerificationInput(false);
            setVerificationCode('');
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
           if (!isEmailVerified) {
               newErrors.email = "이메일 인증을 완료해주세요.";
           }
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

            // DEBUG: 회원가입 요청 데이터
            // console.log("🔍 회원가입 요청 데이터:", requestData);

            const response = await signupAPI(requestData);

            // DEBUG: 회원가입 성공 응답
            // console.log("✅ 회원가입 성공! 응답:", response);
            alert("회원가입에 성공했습니다!");
            navigate('/Login');

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
            <main className="signup-content">
                <div className="signup-wrapper">
                    <div className="signup-card">
                        <div className="signup-form-section">
                            <h2>{t('signup')}</h2>

                            <form onSubmit={handleSignup} className="signup-form">
                                <div className="form-row">
                                    <div className="custom-input-group half">
                                        <label>{t('email')} <span>*</span></label>
                                        <div className="nickname-group">
                                            <Input
                                                type="email"
                                                name="email"
                                                placeholder={t('email_placeholder')}
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className={errors.email ? 'error-input' : ''}
                                                disabled={isEmailVerified}
                                            />
                                            <button 
                                                type="button" 
                                                className="check-btn" 
                                                onClick={handleRequestVerification}
                                                disabled={isEmailVerified}
                                            >
                                                {isEmailVerified ? "인증 완료" : "인증하기"}
                                            </button>
                                        </div>
                                        
                                        {showVerificationInput && (
                                            <div className="nickname-group" style={{ marginTop: '10px' }}>
                                                <Input
                                                    type="text"
                                                    placeholder="인증 코드 6자리"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                />
                                                <button type="button" className="check-btn" onClick={handleConfirmVerification}>
                                                    확인
                                                </button>
                                            </div>
                                        )}

                                        {/* 우선순위: 에러 메시지 > 성공/실패 메시지 */}
                                        {errors.email ? (
                                            <span className="error-msg">{errors.email}</span>
                                        ) : (
                                            emailMessage && <span className={`validation-msg ${isEmailVerified || isEmailAvailable ? 'success' : 'error'}`}>{emailMessage}</span>
                                        )}
                                    </div>
                                    <div className="custom-input-group half">
                                        <label>{t('display_language')} <span>*</span></label>
                                        <Select
                                            value={language}
                                            options={['한국어', '중국어', '베트남어']}
                                            onChange={(val) => setLanguage(val)}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="custom-input-group half">
                                        <label>{t('nickname')}</label>
                                        <div className="nickname-group">
                                            <Input
                                                type="text"
                                                name="nickname"
                                                placeholder={t('nickname_placeholder')}
                                                value={formData.nickname}
                                                onChange={handleChange}
                                                className={errors.nickname ? 'error-input' : ''}
                                            />
                                            <button type="button" className="check-btn" onClick={handleCheckNickname}>
                                                {t('check_duplicate')}
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
                                        <label>{t('native_language')} <span>*</span></label>
                                        <Select
                                            value={formData.nativeLanguage}
                                            options={['한국어', '중국어', '베트남어']}
                                            onChange={(val) => setFormData({ ...formData, nativeLanguage: val })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="custom-input-group half">
                                        <label>{t('password')} <span>*</span></label>
                                        <Input
                                            type="password"
                                            name="password"
                                            placeholder={t('password_placeholder')}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className={errors.password ? 'error-input' : ''}
                                        />
                                        {errors.password && <span className="error-msg">{errors.password}</span>}
                                    </div>
                                    <div className="custom-input-group half">
                                        <label>{t('region')} <span>*</span></label>
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
                                        <label>{t('password_confirm')} <span>*</span></label>
                                        <Input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder={t('password_placeholder')}
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
                                    <Button type="submit" className="signup-btn">{t('signup_action')}</Button>
                                </div>
                            </form>

                            <div className="login-link">
                                {t('have_account')} <span onClick={() => navigate('/Login')}>{t('login')}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </motion.div>
    );
};

export default Signup;
