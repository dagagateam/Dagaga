import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useUserStore } from '../../store/userStore';
import ProfileImageSection from '../../components/my-page-edit/ProfileImageSection';
import EditForm from '../../components/my-page-edit/EditForm';
import './MyPageEdit.css';

const MyPageEdit = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useUserStore();

    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        sido: '시/도 선택',
        gugun: '구/군 선택',
        preferredLang: '한국어',
        nativeLang: 'English',
        entryDate: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState("/assets/profile-placeholder.jpg");

    useEffect(() => {
        if (user) {
            const [sido, gugun] = String(user.region || '').split(' ');
            setFormData({
                nickname: user.nickname || '',
                email: user.email || '',
                sido: sido || '시/도 선택',
                gugun: gugun || '구/군 선택',
                preferredLang: user.preferredLang || '한국어',
                nativeLang: user.nativeLang || 'English',
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
                newErrors.password = "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.";
            }

            if (password !== confirmPassword) {
                newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const regionStr = `${formData.sido} ${formData.gugun !== '구/군 선택' ? formData.gugun : ''}`.trim();
        
        const updates = {
            nickname: formData.nickname,
            region: regionStr,
            preferredLang: formData.preferredLang,
            nativeLang: formData.nativeLang,
            entryDate: formData.entryDate ? formData.entryDate.replaceAll('-', '/') : '',
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
        navigate('/my-page');
    };

    return (
        <Container className="my-page-edit-container">
            <Card className="edit-card mx-auto">
                <Card.Body className="p-5">
                    <h3 className="mb-4 fw-bold">프로필 수정</h3>
                    
                    <Form onSubmit={handleSubmit}>
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

                        <div className="d-flex justify-content-end gap-3 mt-5">
                            <Button variant="light" className="px-4 rounded-pill fw-semibold text-muted" onClick={() => navigate('/my-page')}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" className="px-4 rounded-pill fw-semibold btn-save">
                                Save
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default MyPageEdit;
