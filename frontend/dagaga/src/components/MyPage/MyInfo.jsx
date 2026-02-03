import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { useUserStore } from '../../store/userStore';
import { getLocationName } from '../../data/regionData';
import './MyInfo.css';

const MyInfo = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUserStore();

  const userInfo = (() => {
    if (!user) return {
      nickname: "Guest",
      email: "-",
      preferredLang: "-",
      nativeLang: "-",
      region: "-",
      entryDate: "-"
    };

    // Helper to format date YYYY/MM/DD
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // fallback if invalid
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    // Helper to get translated language name from language code
    const getLangName = (langCode) => {
        if (!langCode) return "-";
        switch(langCode) {
            case 'ko': return t('lang_ko');
            case 'zh': return t('lang_zh');
            case 'vi': return t('lang_vi');
            default: return langCode;
        }
    };

    return {
      nickname: user.nickname || "-",
      email: user.email || "-",
      preferredLang: getLangName(user.viewLangCode),
      nativeLang: getLangName(user.nativeLangCode),
      region: getLocationName(user.locationId) || "-",
      entryDate: formatDate(user.arrivalDate)
    };
  })();

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
            <div className="info-value">{userInfo.region}</div>
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
