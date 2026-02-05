import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { findPasswordAPI } from '../../api/userApi';
import { loginAPI } from '../../api/userApi';
import { useUserStore } from '../../store/userStore';

const FindPasswordModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const login = useUserStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [step, setStep] = useState('input'); // input, result, error
    const [message, setMessage] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
        }

        if (!email.trim()) return;

        setIsLoading(true);
        setMessage('');

        try {
            const response = await findPasswordAPI(email);
            // Success
            setTempPassword(response.tempPassword);
            setStep('result');
            setMessage(t('temp_password_issued') || '임시 비밀번호가 발급되었습니다.');
        } catch (error) {
            console.error("Find Password Failed:", error);
            if (error.response?.status === 400 || error.response?.status === 404) {
                // Not found
                setStep('error');
                setMessage(t('email_not_found'));
            } else {
                setMessage(t('error_occurred') || '오류가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyPassword = async () => {
        try {
            await navigator.clipboard.writeText(tempPassword);
            setCopySuccess('비밀번호가 복사되었습니다!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
            setCopySuccess('복사에 실패했습니다.');
        }
    };

    const handleConfirmResult = async () => {
        // Auto login with temp password and redirect
        try {
            setIsLoading(true);
            const authResponse = await loginAPI(email, tempPassword);
            login(authResponse);
            onClose();
            navigate('/MyPage');
        } catch (error) {
            console.error("Auto login failed:", error);
            onClose();
            navigate('/Login'); // Fallback
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmError = () => {
        onClose();
        navigate('/Signup');
    };

    const handleClose = () => {
        setEmail('');
        setStep('input');
        setMessage('');
        setTempPassword('');
        setCopySuccess('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('find_password') || "비밀번호 찾기"}>
            <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {step === 'input' && (
                    <div style={{ width: '100%', padding: '10px 0' }}>
                        <p style={{ marginBottom: '20px', fontSize: '1rem', color: '#555', fontWeight: '500' }}>
                            {t('enter_email_for_password') || "가입된 이메일을 입력해 주세요"}
                        </p>
                        <div className="custom-input-group" style={{ marginBottom: '20px' }}>
                            <Input
                                type="email"
                                placeholder={t('email_placeholder') || "이메일 입력"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmit(e);
                                    }
                                }}
                                autoFocus
                                style={{ width: '100%' }}
                            />
                        </div>
                        {message && <p style={{ color: '#ff4d4f', fontSize: '0.9rem', marginTop: '5px', marginBottom: '10px' }}>{message}</p>}
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="login-btn"
                            style={{ marginTop: '10px' }}
                        >
                            {isLoading ? (t('processing') || "처리중...") : (t('confirm') || "확인")}
                        </Button>
                    </div>
                )}

                {step === 'result' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <p style={{ marginBottom: '15px', color: '#333', fontSize: '1.1rem', fontWeight: 'bold' }}>{t('temp_password_sent_desc') || "새로운 임시 비밀번호가 발급되었습니다."}</p>

                        <div style={{
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            border: '1px solid #eee'
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                letterSpacing: '3px',
                                color: '#F8B15E',
                                marginBottom: '10px',
                                wordBreak: 'break-all'
                            }}>
                                {tempPassword}
                            </div>
                            <Button
                                onClick={handleCopyPassword}
                                style={{
                                    backgroundColor: '#fff',
                                    color: '#555',
                                    border: '1px solid #ddd',
                                    padding: '5px 15px',
                                    fontSize: '0.9rem',
                                    width: 'auto',
                                    borderRadius: '20px'
                                }}
                            >
                                {copySuccess ? "복사 완료!" : "비밀번호 복사"}
                            </Button>
                        </div>

                        <p style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#e53935' }}>
                            {t('change_password_warning') || "보안을 위해 로그인 후 즉시 비밀번호를 변경해주세요."}
                        </p>
                        <Button onClick={handleConfirmResult} disabled={isLoading} className="login-btn">
                            {t('login_and_go_mypage') || "로그인 및 마이페이지로 이동"}
                        </Button>
                    </div>
                )}

                {step === 'error' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <p style={{ marginBottom: '30px', color: '#333', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{message}</p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <Button onClick={handleClose} style={{ backgroundColor: '#f1f3f5', color: '#333', border: 'none' }}>
                                {t('cancel') || "취소"}
                            </Button>
                            <Button onClick={handleConfirmError} style={{ width: 'auto', padding: '0 30px' }}>
                                {t('signup') || "회원가입"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default FindPasswordModal;
