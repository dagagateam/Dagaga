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
    const [isLoading, setIsLoading] = useState(false);

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
            await findPasswordAPI(email);
            // Success
            setStep('result');
            setMessage(t('temp_password_sent_email') || '임시 비밀번호가 이메일로 전송되었습니다.');
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

    const handleConfirmResult = () => {
        onClose();
        navigate('/Login');
    };

    const handleConfirmError = () => {
        onClose();
        navigate('/Signup');
    };

    const handleClose = () => {
        setEmail('');
        setStep('input');
        setMessage('');
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
                        <p style={{ marginBottom: '15px', color: '#333', fontSize: '1.1rem', fontWeight: 'bold' }}>{message}</p>


                        <div style={{
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            border: '1px solid #eee'
                        }}>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                {t('check_email_spam') || "메일함을 확인해주세요.\n메일이 오지 않았다면 스팸함도 확인해주세요."}
                            </p>
                        </div>

                        <p style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#e53935' }}>
                            {t('change_password_warning') || "보안을 위해 로그인 후 즉시 비밀번호를 변경해주세요."}
                        </p>
                        <Button onClick={handleConfirmResult} disabled={isLoading} className="login-btn">
                            {t('go_to_login') || "로그인 하러 가기"}
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
