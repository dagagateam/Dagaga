import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { socialSignupAPI, checkNicknameAPI } from '../../api/userApi';
import { useUserStore } from '../../store/userStore';
import './Signup.css'; // Reuse Signup styles
import loginTiger from '../../assets/characters/login_tiger2.png';
import logo from '../../assets/icons/logo.png';
import { getLocationId } from '../../data/regionData';
import LanguageSelector from '../../components/auth/LanguageSelector';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import RegionSelect from '../../components/common/RegionSelect';
import Select from '../../components/common/Select';
import ArrivalDateInput from '../../components/common/ArrivalDateInput';

import { motion } from 'framer-motion';

const SocialSignup = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const login = useUserStore((state) => state.login);

    const [language, setLanguage] = useState('한국어');
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        nativeLanguage: '중국어',
        sido: '시/도 선택',
        gugun: '구/군 선택',
        arrivalDate: ''
    });

    const [errors, setErrors] = useState({});
    const [nicknameMessage, setNicknameMessage] = useState('');
    const [isNicknameAvailable, setIsNicknameAvailable] = useState(null);

    useEffect(() => {
        const email = searchParams.get('email');
        if (email) {
            setFormData(prev => ({ ...prev, email }));
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate]);

    const handleSidoChange = (selectedSido) => {
        setFormData(prev => ({ ...prev, sido: selectedSido, gugun: '구/군 선택' }));
    };

    const handleGugunChange = (selectedGugun) => {
        setFormData(prev => ({ ...prev, gugun: selectedGugun }));
    };

    const handleCheckNickname = async () => {
        const { nickname } = formData;
        const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;

        if (!nickname) {
            setErrors(prev => ({ ...prev, nickname: "닉네임을 입력해주세요." }));
            return;
        }

        if (!nicknameRegex.test(nickname)) {
            setErrors(prev => ({ ...prev, nickname: "닉네임은 특수문자 제외 2~10자여야 합니다." }));
            return;
        }

        try {
            const isAvailable = await checkNicknameAPI(nickname);
            setIsNicknameAvailable(isAvailable);
            if (isAvailable) {
                setNicknameMessage("사용 가능한 닉네임입니다.");
                setErrors(prev => ({ ...prev, nickname: '' }));
            } else {
                setNicknameMessage("이미 사용 중인 닉네임입니다.");
            }
        } catch (error) {
            setNicknameMessage("닉네임 확인 중 오류가 발생했습니다.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'nickname') {
            setIsNicknameAvailable(null);
            setNicknameMessage('');
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (isNicknameAvailable !== true) {
            setErrors(prev => ({ ...prev, nickname: "닉네임 중복 확인을 해주세요." }));
            return;
        }

        try {
            const locationId = getLocationId(formData.sido, formData.gugun);
            const requestData = {
                email: formData.email,
                nickname: formData.nickname,
                viewLangCode: language === '한국어' ? 'ko' : (language === '중국어' ? 'zh' : 'vi'),
                nativeLangCode: formData.nativeLanguage === '한국어' ? 'ko' : (formData.nativeLanguage === '중국어' ? 'zh' : 'vi'),
                locationId: locationId,
                arrivalDate: formData.arrivalDate || null
            };

            const response = await socialSignupAPI(requestData);
            login(response);
            navigate('/ScenarioSelect');
        } catch (error) {
            console.error("Social Signup failed:", error);
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
                <div className="logo-area"><img src={logo} alt="Dagaga Logo" style={{ height: '40px' }} /></div>
                <LanguageSelector language={language} setLanguage={setLanguage} />
            </header>

            <main className="signup-content">
                <div className="signup-wrapper">
                    <div className="signup-card">
                        <div className="signup-left-section">
                            <h2>{t('social_signup_title', '소셜 회원가입')}</h2>
                            <p style={{ marginBottom: '20px', color: '#666' }}>{t('social_signup_desc', '추가 정보를 입력하여 회원가입을 완료해주세요.')}</p>

                            <form onSubmit={handleSignup} className="signup-form">
                                <div className="form-row">
                                    <div className="custom-input-group half">
                                        <label>{t('email')} <span>*</span></label>
                                        <Input type="email" name="email" value={formData.email} disabled />
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
                                        <label>{t('nickname')} <span>*</span></label>
                                        <div className="nickname-group">
                                            <Input
                                                name="nickname"
                                                value={formData.nickname}
                                                onChange={handleChange}
                                                placeholder={t('nickname_placeholder')}
                                            />
                                            <button type="button" className="check-btn" onClick={handleCheckNickname}>
                                                {t('check_duplicate')}
                                            </button>
                                        </div>
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
                                            options={[t('korean'), t('chinese'), t('vietnamese')]}
                                            onChange={(val) => setFormData({ ...formData, nativeLanguage: val })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
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
                                    <div className="custom-input-group half">
                                        <ArrivalDateInput
                                            value={formData.arrivalDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="signup-action">
                                    <Button type="submit" className="signup-btn">
                                        {t('complete_signup', '가입 완료')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <img src={loginTiger} alt="Welcome Tiger" className="signup-tiger-image" />
                </div>
            </main>
        </motion.div>
    );
};

export default SocialSignup;
