import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useUserStore } from '../../store/userStore';
import ProfileImageSection from '../../components/my-page-edit/ProfileImageSection';
import EditForm from '../../components/my-page-edit/EditForm';
import './my-page-edit.css';

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
        password: '',
    });

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
                password: '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const regionStr = `${formData.sido} ${formData.gugun !== '구/군 선택' ? formData.gugun : ''}`.trim();
        
        const updates = {
            nickname: formData.nickname,
            region: regionStr,
            preferredLang: formData.preferredLang,
            nativeLang: formData.nativeLang,
        };
        
        updateUser(updates);
        navigate('/my-page');
    };

    return (
        <Container className="my-page-edit-container py-5">
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
