import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dropdown, InputGroup } from 'react-bootstrap';
import { signupAPI, checkEmailAPI, checkNicknameAPI, requestVerificationAPI, confirmVerificationAPI } from '../../api/userApi';
import './Signup.css';
import { area0, allAreas, getLocationId } from '../../data/regionData';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PasswordToggleButton from '../../components/common/PasswordToggleButton';
import RegionSelect from '../../components/common/RegionSelect';
import Select from '../../components/common/Select';
import ArrivalDateInput from '../../components/common/ArrivalDateInput';

import { motion } from 'framer-motion';

const Signup = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [language, setLanguage] = useState('한국어');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        nativeLanguage: '중국어',
        sido: '',
        gugun: '',
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
            gugun: '' // Reset gugun
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
            setErrors({ ...errors, email: t('email_required') });
            return;
        }

        if (!emailRegex.test(email)) {
            setErrors({ ...errors, email: t('email_invalid_format') });
            return;
        }

        try {
            // 1. Check Duplicate first
            const isAvailable = await checkEmailAPI(email);
            setIsEmailAvailable(isAvailable);

            if (!isAvailable) {
                setEmailMessage(t('email_duplicate'));
                return;
            }

            // 2. Request Verification Code
            await requestVerificationAPI(email);
            setEmailMessage(t('verification_code_sent'));
            setShowVerificationInput(true);
            setErrors({ ...errors, email: '' });

        } catch (error) {
            setEmailMessage(t('verification_send_error'));
            setIsEmailAvailable(false);
        }
    };

    const handleConfirmVerification = async () => {
        if (!verificationCode) {
            alert(t('verification_code_required'));
            return;
        }

        try {
            await confirmVerificationAPI(formData.email, verificationCode);
            setIsEmailVerified(true);
            setShowVerificationInput(false);
            setEmailMessage(t('email_verified_success'));
        } catch (error) {
            alert(t('verification_code_invalid'));
        }
    };

    // Handle Nickname Check
    const handleCheckNickname = async () => {
        const { nickname } = formData;
        const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;

        if (!nickname) {
            setErrors({ ...errors, nickname: t('nickname_required') });
            return;
        }

        if (!nicknameRegex.test(nickname)) {
            setErrors({ ...errors, nickname: t('error_nickname_format') });
            return;
        }

        const isAvailable = await checkNicknameAPI(nickname);
        setIsNicknameAvailable(isAvailable);

        if (isAvailable) {
            setNicknameMessage(t('nickname_available'));
            setErrors({ ...errors, nickname: '' });
        } else {
            setNicknameMessage(t('error_nickname_duplicate'));
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
                    setPasswordMatchMessage(t('password_match'));
                    setIsPasswordMatch(true);
                } else {
                    setPasswordMatchMessage(t('password_error_match'));
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
            newErrors.password = t('password_requirements_msg');
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = t('password_error_match');
        }

        // 2. Nickname Validation (Client-side format check only here, duplicates checked via button)
        if (isNicknameAvailable === false) {
            newErrors.nickname = t('error_nickname_duplicate');
        } else if (isNicknameAvailable === null && formData.nickname) {
            newErrors.nickname = t('nickname_check_req');
        }

        // 3. Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            newErrors.email = t('email_invalid_format');
        }

        // 4. Duplicate Checks (API Call)
        // 실제로는 입력 시점(onBlur 등)에 체크하는 것이 좋지만 여기서는 가입 시점에 체크
        if (!newErrors.email) {
            if (!isEmailVerified) {
                newErrors.email = t('email_verification_required');
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
            alert(t('signup_success'));
            navigate('/Login');

        } catch (error) {
            console.error("Signup failed:", error);
            alert(t('signup_error'));
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
                                                {isEmailVerified ? t('verification_complete') : t('verify_action')}
                                            </button>
                                        </div>

                                        {showVerificationInput && (
                                            <div className="nickname-group" style={{ marginTop: '10px' }}>
                                                <Input
                                                    type="text"
                                                    placeholder={t('verification_code_placeholder')}
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                />
                                                <button type="button" className="check-btn" onClick={handleConfirmVerification}>
                                                    {t('confirm_action')}
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
                                            options={['한국어', '中文', 'Tiếng Việt']}
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
                                            options={['한국어', '中文', 'Tiếng Việt']}
                                            onChange={(val) => setFormData({ ...formData, nativeLanguage: val })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="custom-input-group half">
                                        <label>{t('password')} <span>*</span></label>
                                        <InputGroup>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                placeholder={t('password_placeholder')}
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className={`form-control rounded-end-0 border-end-0 ${errors.password ? 'error-input' : ''}`}
                                            />
                                            <PasswordToggleButton
                                                showPassword={showPassword}
                                                onClick={() => setShowPassword(!showPassword)}
                                                isError={!!errors.password}
                                                className="bg-white border rounded-end-3 border-start-0"
                                                style={{ borderColor: '#ddd' }}
                                            />
                                        </InputGroup>
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
                                        <InputGroup>
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                placeholder={t('password_placeholder')}
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                                className={`form-control rounded-end-0 border-end-0 ${errors.confirmPassword ? 'error-input' : ''}`}
                                            />
                                            <PasswordToggleButton
                                                showPassword={showConfirmPassword}
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                isError={!!errors.confirmPassword}
                                                className="bg-white border rounded-end-3 border-start-0"
                                                style={{ borderColor: '#ddd' }}
                                            />
                                        </InputGroup>
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
