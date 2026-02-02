import React from 'react';
import { Form } from 'react-bootstrap';

const ProfileImageSection = ({ previewImage, onImageChange }) => {
    return (
        <div className="text-center mb-5">
            <div className="profile-edit-wrapper mx-auto mb-3">
                <img src={previewImage} alt="Profile" className="profile-edit-img" />
            </div>
            <div className="image-upload-btn-wrapper">
                <Form.Label htmlFor="profile-upload" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                    프로필 바꾸기
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
