import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { useUserStore } from '../../store/userStore';
import './MyInfo.css';

const MyInfo = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUserStore();

  const userInfo = user || {
    nickname: "Guest",
    email: "-",
    preferredLang: "-",
    nativeLang: "-",
    region: "-",
    entryDate: "-"
  };

  return (
    <Card className="my-info-card">
      <Card.Body>
        <div className="my-info-header">
          <Button className="edit-info-btn" onClick={() => navigate('/MyPage/Edit')}>{t('edit_profile')}</Button>
        </div>
        
        <Row className="info-grid">
          <Col md={4} className="info-item">
            <label className="info-label">{t('nickname')}</label>
            <div className="info-value">{userInfo.nickname}</div>
          </Col>
          <Col md={4} className="info-item">
            <label className="info-label">{t('preferred_language')}</label>
            <div className="info-value">{userInfo.preferredLang}</div>
          </Col>
          <Col md={4} className="info-item">
            <label className="info-label">{t('region')}</label>
            <div className="info-value">{userInfo.regionName || userInfo.region}</div>
          </Col>
          
          <Col md={4} className="info-item mt-3">
            <label className="info-label">{t('email')}</label>
            <div className="info-value email-value">{userInfo.email}</div>
          </Col>
          <Col md={4} className="info-item mt-3">
            <label className="info-label">{t('native_language')}</label>
            <div className="info-value">{userInfo.nativeLang}</div>
          </Col>
          <Col md={4} className="info-item mt-3">
            <label className="info-label">{t('entry_date_short')}</label>
            <div className="info-value">{userInfo.entryDate}</div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default MyInfo;
