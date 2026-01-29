import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import './my-info.css';

const MyInfo = () => {
  const navigate = useNavigate();
  // Mock user data
  const userInfo = {
    nickname: "닉네임",
    email: "닉네임@gmail.com",
    preferredLang: "한국어",
    nativeLang: "중국어",
    region: "서울 종로구",
    entryDate: "2012/03/06"
  };

  return (
    <Card className="my-info-card">
      <Card.Body>
        <div className="my-info-header">
          <Button className="edit-info-btn" onClick={() => navigate('/my-page/edit')}>수정하기</Button>
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
            <div className="info-value">{userInfo.region}</div>
          </Col>
          
          <Col md={4} className="info-item mt-4">
            <label className="info-label">이메일</label>
            <div className="info-value email-value">{userInfo.email}</div>
          </Col>
          <Col md={4} className="info-item mt-4">
            <label className="info-label">모국어</label>
            <div className="info-value">{userInfo.nativeLang}</div>
          </Col>
          <Col md={4} className="info-item mt-4">
            <label className="info-label">한국에 온 날</label>
            <div className="info-value">{userInfo.entryDate}</div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default MyInfo;
