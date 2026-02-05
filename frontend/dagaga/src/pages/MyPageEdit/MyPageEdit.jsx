import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Form, Button, Card, Modal } from 'react-bootstrap';
import { useUserStore } from '../../store/userStore';
import { getLocationId } from '../../data/regionData';
import ProfileImageSection from '../../components/MyPageEdit/ProfileImageSection';
import EditForm from '../../components/MyPageEdit/EditForm';
import stockProfile from '../../assets/icons/stock_profile.jpg';
import './MyPageEdit.css';

const MyPageEdit = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, updateUserProfile, logout } = useUserStore();

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
    
    // Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingUpdates, setPendingUpdates] = useState(null);

    useEffect(() => {
        if (user) {
            // Import getLocationName to convert locationId to region name
            import('../../data/regionData').then(({ getLocationName }) => {
                const regionName = getLocationName(user.locationId) || '';
                const [sido, gugun] = regionName.split(' ');
                
                // Map language codes back to display values for dropdowns
                const langCodeToDisplay = {
                    'ko': '한국어',
                    'zh': '中文',
                    'vi': 'Việt Nam'
                };
                
                setFormData({
                    nickname: user.nickname || '',
                    email: user.email || '',
                    sido: sido || '시/도 선택',
                    gugun: gugun || '구/군 선택',
                    preferredLang: langCodeToDisplay[user.viewLangCode] || '한국어',
                    nativeLang: langCodeToDisplay[user.nativeLangCode] || '한국어',
                    entryDate: user.arrivalDate || '', // Use arrivalDate, keeps YYYY-MM-DD from API
                    password: '', // Always empty
                    confirmPassword: '', // Always empty
                });
                
                // Load profile image if exists
                if (user.profileImage) {
                    setPreviewImage(user.profileImage);
                }
            });
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
            // Regex: At least one letter, one number, one special character (*, +, -), min 8 chars
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[*+-])[A-Za-z\d*+-]{8,}$/;
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        // Calculate locationId using the selected sido/gugun
        let locationId = null;
        if (formData.sido && formData.sido !== '시/도 선택') {
             locationId = getLocationId(formData.sido, formData.gugun === '구/군 선택' ? null : formData.gugun);
             
             if (!locationId) {
                // Silently ignore if it's just invalid/default, but warn if it looks like a real value
                // Since we already checked !== '시/도 선택', this implies a mapping failure for a "real" name
                // console.warn("Could not find locationId for", formData.sido, formData.gugun);
             }
        }

        // Map preferredLang to viewLangCode
        const langMap = {
            '한국어': 'ko',
            '中文': 'zh',
            'Việt Nam': 'vi'
        };
        // Fallback to 'ko' or keep existing if not mapped? 
        // It's safer to map correctly. 
        // In the dropdown (not shown in this file but assumed based on other code), the values are likely Korean names.
        const viewLangCode = langMap[formData.preferredLang] || 'ko';
        
        // Map nativeLang to nativeLangCode if needed, or assume same map
        const nativeLangCode = langMap[formData.nativeLang] || 'ko';

        const updates = {
            nickname: formData.nickname,
            locationId: locationId, // Send ID, not string
            viewLangCode: viewLangCode,
            nativeLangCode: nativeLangCode,
            arrivalDate: formData.entryDate || null, // Send YYYY-MM-DD (as is from input type=date)
        };

        // Only include password if it was checked/changed
        if (formData.password) {
            updates.password = formData.password;
        }

        // Include profile image
        if (previewImage && previewImage !== stockProfile) {
             updates.profileImage = previewImage;
        }
        
        // User requested to show modal for ANY change
        // We assume valid submission implies intent to update
        setPendingUpdates(updates);
        setShowConfirmModal(true);
    };

    const handleConfirmUpdate = async () => {
        if (!pendingUpdates) return;

        try {
            await updateUserProfile(pendingUpdates);
            setShowConfirmModal(false);
            
            // Logout and Redirect
            logout();
            navigate('/Login');
        } catch (error) {
            console.error("Update failed:", error);
            setErrors(prev => ({ ...prev, submit: t('update_failed') || "Update failed" }));
            setShowConfirmModal(false);
        }
    };

    return (
        <>
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

        {/* Confirmation Modal */}
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered dialogClassName="confirm-modal-dialog">
            <Modal.Header closeButton className="confirm-modal-header">
                <Modal.Title className="confirm-modal-title">{t('notice')}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="confirm-modal-body">
                <p className="confirm-modal-text">
                    {t('info_changed_relogin')}
                </p>
            </Modal.Body>
            <Modal.Footer className="confirm-modal-footer">
                <Button variant="light" onClick={() => setShowConfirmModal(false)} className="confirm-modal-btn text-muted">
                    {t('cancel')}
                </Button>
                <Button variant="primary" onClick={handleConfirmUpdate} className="confirm-modal-btn btn-save text-white">
                    {t('confirm')}
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
};

export default MyPageEdit;
