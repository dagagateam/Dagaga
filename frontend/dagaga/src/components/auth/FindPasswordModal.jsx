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

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                setMessage(t('email_not_found') || '가입되지 않은 이메일입니다.\n회원가입 페이지로 이동하시겠습니까?');
            } else {
                setMessage(t('error_occurred') || '오류가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmResult = async () => {
        // Auto login with temp password and redirect
        try {
            setIsLoading(true);
            const authResponse = await loginAPI(email, tempPassword);
            login(authResponse);
            onClose();
            // Redirect to MyPage or Home -> MyPage per requirement
            // But wait, user might want to change password immediately. 
            // The requirement says "change password modal and redirect to MyPage".
            // Since we are creating logic here:
            // 1. Auto login.
            // 2. Navigate to MyPage.
            // 3. User can change password there. 
            // (Ideally we should show "Change Password" modal on MyPage upon arrival, but that requires more state passing. 
            //  Simplify: Just redirect to MyPage so they can see profile.)
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
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('find_password') || "비밀번호 찾기"}>
            {step === 'input' && (
                <form onSubmit={handleSubmit}>
                    <p style={{marginBottom: '10px', fontSize: '0.9rem', color: '#666'}}>
                        {t('enter_email_for_password') || "가입한 이메일을 입력해주세요."}
                    </p>
                    <Input
                        type="email"
                        placeholder={t('email_placeholder') || "이메일 입력"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                    />
                    {message && <p style={{color: 'red', fontSize: '0.8rem', marginTop: '5px'}}>{message}</p>}
                    <Button type="submit" disabled={isLoading} style={{marginTop: '15px'}}>
                        {isLoading ? (t('processing') || "처리중...") : (t('confirm') || "확인")}
                    </Button>
                </form>
            )}

            {step === 'result' && (
                <div style={{textAlign: 'center'}}>
                    <p style={{marginBottom: '10px', color: '#333'}}>{t('temp_password_sent_desc') || "새로운 임시 비밀번호가 발급되었습니다."}</p>
                    <div style={{
                        background: '#f5f5f5', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold', 
                        letterSpacing: '2px',
                        marginBottom: '20px',
                        wordBreak: 'break-all'
                    }}>
                        {tempPassword}
                    </div>
                    <p style={{marginBottom: '20px', fontSize: '0.9rem', color: '#e53935'}}>
                        {t('change_password_warning') || "보안을 위해 로그인 후 즉시 비밀번호를 변경해주세요."}
                    </p>
                    <Button onClick={handleConfirmResult} disabled={isLoading}>
                        {t('login_and_go_mypage') || "로그인 및 마이페이지로 이동"}
                    </Button>
                </div>
            )}

            {step === 'error' && (
                <div style={{textAlign: 'center'}}>
                    <p style={{marginBottom: '20px', color: '#333', whiteSpace: 'pre-line'}}>{message}</p>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <Button onClick={handleClose} style={{backgroundColor: '#999'}}>
                            {t('cancel') || "취소"}
                        </Button>
                        <Button onClick={handleConfirmError}>
                            {t('signup') || "회원가입"}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default FindPasswordModal;
