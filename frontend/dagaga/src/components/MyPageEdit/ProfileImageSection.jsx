import React from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import stockProfile from '../../assets/icons/stock_profile.jpg';

const ProfileImageSection = ({ previewImage, onImageChange }) => {
    const { t } = useTranslation();
    return (
        <div className="text-center mb-5">
            <div className="profile-edit-wrapper mx-auto mb-3">
                <img 
                    src={previewImage || stockProfile} 
                    alt="Profile" 
                    className="profile-edit-img" 
                    onError={(e) => {e.target.src = stockProfile}}
                />
            </div>
            <div className="image-upload-btn-wrapper">
                <Form.Label htmlFor="profile-upload" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                    {t('change_profile')}
                </Form.Label>
                <Form.Control 
                    type="file" 
                    id="profile-upload" 
                    accept="image/*" 
                    onChange={onImageChange} 
                    style={{ display: 'none' }} 
                />
            </div>
        </div>
    );
};

export default ProfileImageSection;
