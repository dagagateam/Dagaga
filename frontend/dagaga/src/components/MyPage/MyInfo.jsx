import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { useUserStore } from '../../store/userStore';
import './MyInfo.css';

const MyInfo = () => {
  const navigate = useNavigate();
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
          <Button className="edit-info-btn" onClick={() => navigate('/MyPage/Edit')}>프로필 수정하기</Button>
        </div>
        
        <Row className="info-grid">
          <Col md={4} className="info-item">
            <label className="info-label">닉네임</label>
            <div className="info-value">{userInfo.nickname}</div>
          </Col>
          <Col md={4} className="info-item">
            <label className="info-label">선호 언어</label>
            <div className="info-value">{userInfo.preferredLang}</div>
          </Col>
          <Col md={4} className="info-item">
            <label className="info-label">지역</label>
            <div className="info-value">{userInfo.regionName || userInfo.region}</div>
          </Col>
          
          <Col md={4} className="info-item mt-3">
            <label className="info-label">이메일</label>
            <div className="info-value email-value">{userInfo.email}</div>
          </Col>
          <Col md={4} className="info-item mt-3">
            <label className="info-label">모국어</label>
            <div className="info-value">{userInfo.nativeLang}</div>
          </Col>
          <Col md={4} className="info-item mt-3">
            <label className="info-label">한국에 온 날</label>
            <div className="info-value">{userInfo.entryDate}</div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default MyInfo;
