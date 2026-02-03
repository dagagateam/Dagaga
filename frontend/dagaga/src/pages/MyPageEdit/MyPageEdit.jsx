import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useUserStore } from '../../store/userStore';
import ProfileImageSection from '../../components/MyPageEdit/ProfileImageSection';
import EditForm from '../../components/MyPageEdit/EditForm';
import stockProfile from '../../assets/icons/stock_profile.jpg';
import './MyPageEdit.css';

const MyPageEdit = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, updateUser } = useUserStore();

    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        sido: '시/도 선택',
        gugun: '구/군 선택',
        preferredLang: '한국어',
        nativeLang: '한국어',
        entryDate: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(stockProfile);

    useEffect(() => {
        if (user) {
            // Use regionName if available (e.g., "서울 종로구"), otherwise fall back to region (though region might be a code)
            const regionSource = user.regionName || String(user.region || '');
            const [sido, gugun] = regionSource.split(' ');
            setFormData({
                nickname: user.nickname || '',
                email: user.email || '',
                sido: sido || '시/도 선택',
                gugun: gugun || '구/군 선택',
                preferredLang: user.preferredLang || '한국어',
                nativeLang: user.nativeLang || '한국어',
                entryDate: user.entryDate ? user.entryDate.replaceAll('/', '-') : '',
                password: '',
                confirmPassword: '',
            });
            
            // Load profile image if exists
            if (user.profileImage) {
                setPreviewImage(user.profileImage);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear errors when typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSidoChange = (val) => {
        setFormData(prev => ({ ...prev, sido: val, gugun: '구/군 선택' }));
    };

    const handleGugunChange = (val) => {
        setFormData(prev => ({ ...prev, gugun: val }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        const newErrors = {};
        const { password, confirmPassword } = formData;

        // Password Validation (Only if user entered something)
        if (password) {
            // Regex: At least one letter, one number, one special character (non-word), min 8 chars
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            if (!passwordRegex.test(password)) {
                newErrors.password = t('password_error_requirements');
            }

            if (password !== confirmPassword) {
                newErrors.confirmPassword = t('password_error_match');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const regionStr = `${formData.sido} ${formData.gugun !== '구/군 선택' ? formData.gugun : ''}`.trim();
        
        // Map preferredLang to viewLangCode
        const langMap = {
            '한국어': 'ko',
            '중국어': 'zh',
            '베트남어': 'vi'
        };
        const viewLangCode = langMap[formData.preferredLang] || 'ko';

        const updates = {
            nickname: formData.nickname,
            // region: user.region,
            // The logic below constructs regionStr from names and sends it.
            region: regionStr,
            regionName: regionStr, // Update regionName as well just in case
            preferredLang: formData.preferredLang,
            nativeLang: formData.nativeLang,
            entryDate: formData.entryDate ? formData.entryDate.replaceAll('-', '/') : '',
            viewLangCode: viewLangCode, // Add this to trigger store update
        };

        // Only include password if it was changed
        if (formData.password) {
            updates.password = formData.password;
        }

        // Include profile image in updates (using the data URL from previewImage)
        // Note: In a real app, you'd upload the file to a server and save the URL.
        // Here we are saving the base64 string directly to localStorage via zustand.
        updates.profileImage = previewImage;
        
        updateUser(updates);
        navigate('/MyPage');
    };

    return (
        <Container className="my-page-edit-container">
            <Card className="edit-card mx-auto">
                <Card.Body className="p-5">
                    <h3 className="mb-4 fw-bold">{t('edit_profile_title')}</h3>
                    
                    <Form onSubmit={handleSubmit}>
                    <div className="edit-form-scroll">
                        <ProfileImageSection 
                            previewImage={previewImage} 
                            onImageChange={handleImageChange} 
                        />

                        <EditForm 
                            formData={formData} 
                            handleChange={handleChange}
                            handleSidoChange={handleSidoChange}
                            handleGugunChange={handleGugunChange}
                            errors={errors}
                        />
                    </div>

                        <div className="d-flex justify-content-end gap-3 mt-5">
                            <Button variant="light" className="px-4 rounded-pill fw-semibold text-muted" onClick={() => navigate('/MyPage')}>
                                {t('cancel')}
                            </Button>
                            <Button variant="primary" type="submit" className="px-4 rounded-pill fw-semibold btn-save">
                                {t('save')}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default MyPageEdit;
