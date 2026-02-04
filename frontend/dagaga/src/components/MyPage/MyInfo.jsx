import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { useUserStore } from '../../store/userStore';
import { getLocationName } from '../../data/regionData';
import { verifyPasswordAPI } from '../../api/userApi';
import './MyInfo.css';

const MyInfo = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUserStore();

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyError, setVerifyError] = useState('');

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

  const handleEditClick = () => {
    // 소셜 로그인 유저는 비밀번호 검증 생략
    // socialProvider가 있으면 소셜 유저로 간주
    if (user && user.socialProvider) {
      navigate('/MyPage/Edit');
    } else {
      setVerifyPassword('');
      setVerifyError('');
      setShowVerifyModal(true);
    }
  };

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setVerifyError('');

    try {
      await verifyPasswordAPI(verifyPassword);
      setShowVerifyModal(false);
      navigate('/MyPage/Edit');
    } catch (error) {
      setVerifyError(t('password_verify_failed', '비밀번호가 일치하지 않습니다.'));
    }
  };

  return (
    <Card className="my-info-card">
      <Card.Body>
        <div key="header" className="my-info-header">
          <Button className="edit-info-btn" onClick={handleEditClick}>{t('edit_profile')}</Button>
        </div>
        
        <Row key="info-grid" className="info-grid">
          <Col key="nickname" md={4} className="info-item">
            <label className="info-label">{t('nickname')}</label>
            <div className="info-value">{userInfo.nickname}</div>
          </Col>
          <Col key="preferredLang" md={4} className="info-item">
            <label className="info-label">{t('preferred_language')}</label>
            <div className="info-value">{userInfo.preferredLang}</div>
          </Col>
          <Col key="region" md={4} className="info-item">
            <label className="info-label">{t('region')}</label>
            <div className="info-value">{userInfo.region}</div>
          </Col>
          
          <Col key="email" md={4} className="info-item mt-3">
            <label className="info-label">{t('email')}</label>
            <div className="info-value email-value">{userInfo.email}</div>
          </Col>
          <Col key="nativeLang" md={4} className="info-item mt-3">
            <label className="info-label">{t('native_language')}</label>
            <div className="info-value">{userInfo.nativeLang}</div>
          </Col>
          <Col key="entryDate" md={4} className="info-item mt-3">
            <label className="info-label">{t('entry_date_short')}</label>
            <div className="info-value">{userInfo.entryDate}</div>
          </Col>
        </Row>
      </Card.Body>

      {/* 비밀번호 확인 모달 */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('verify_password', '비밀번호 확인')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('verify_password_desc', '정보 수정을 위해 비밀번호를 입력해주세요.')}</p>
          <Form onSubmit={handleVerifyPassword}>
            <Form.Group>
              <Form.Control
                type="password"
                placeholder={t('password', '비밀번호')}
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                autoFocus
              />
            </Form.Group>
            {verifyError && <div className="text-danger mt-2">{verifyError}</div>}
            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={() => setShowVerifyModal(false)} className="me-2">
                {t('cancel', '취소')}
              </Button>
              <Button variant="primary" type="submit">
                {t('confirm', '확인')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default MyInfo;
