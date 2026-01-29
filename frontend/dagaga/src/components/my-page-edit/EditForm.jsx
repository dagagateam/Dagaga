import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import RegionSelect from '../common/RegionSelect';
import '../../pages/my-page-edit/my-page-edit.css';

const EditForm = ({ formData, handleChange, handleSidoChange, handleGugunChange }) => {
    return (
        <Row className="g-4">
            {/* Nickname */}
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold text-muted">닉네임</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="nickname" 
                        value={formData.nickname} 
                        onChange={handleChange} 
                        className="rounded-3 bg-light border-0 py-2"
                        placeholder="Your Nickname"
                    />
                </Form.Group>
            </Col>

            {/* Password */}
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold text-muted">비밀번호</Form.Label>
                    <Form.Control 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange}
                        className="rounded-3 bg-light border-0 py-2"
                        placeholder="Min. 8 characters"
                    />
                </Form.Group>
            </Col>

            {/* Region */}
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold text-muted">지역</Form.Label>
                    <RegionSelect 
                        sido={formData.sido}
                        gugun={formData.gugun}
                        onSidoChange={handleSidoChange}
                        onGugunChange={handleGugunChange}
                    />
                </Form.Group>
            </Col>

            {/* Native Language */}
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold text-muted">모국어</Form.Label>
                    <Form.Select 
                        name="nativeLang" 
                        value={formData.nativeLang} 
                        onChange={handleChange}
                        className="rounded-3 bg-light border-0 py-2"
                    >
                        <option value="한국어">한국어</option>
                        <option value="중국어">중국어</option>
                        <option value="베트남어">베트남어</option>
                    </Form.Select>
                </Form.Group>
            </Col>

            {/* Preferred Language */}
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold text-muted">선호하는 언어</Form.Label>
                    <Form.Select 
                        name="preferredLang" 
                        value={formData.preferredLang} 
                        onChange={handleChange}
                        className="rounded-3 bg-light border-0 py-2"
                    >
                        <option value="한국어">한국어</option>
                        <option value="중국어">중국어</option>
                        <option value="베트남어">베트남어</option>
                    </Form.Select>
                </Form.Group>
            </Col>
        </Row>
    );
};

export default EditForm;
