import React, { useState } from "react";
import { Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import RegionSelect from "../common/RegionSelect.jsx";
import { useTranslation } from "react-i18next";
import "../../pages/MyPageEdit/MyPageEdit.css";

const EditForm = ({
  formData,
  handleChange,
  handleSidoChange,
  handleGugunChange,
  errors,
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Row className="g-4">
      {/* Nickname */}
      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-semibold text-muted">{t('nickname')}</Form.Label>
          <Form.Control
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            className="rounded-3 bg-light border-0 py-2"
            placeholder={t('nickname_placeholder')}
          />
        </Form.Group>
      </Col>

      {/* Password */}
      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-semibold text-muted">{t('password')}</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`rounded-start-3 bg-light border-0 py-2 ${errors?.password ? "is-invalid" : ""}`}
              placeholder={t('password_requirements')}
            />
            <Button
              variant="light"
              className={`border-0 bg-light rounded-end-3 ${errors?.password ? "border-danger" : ""}`}
              onClick={() => setShowPassword(!showPassword)}
              style={{ zIndex: 0 }} // Prevent Bootstrap overlap issues
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </Button>
          </InputGroup>
          {errors?.password && (
            <div className="text-danger small mt-1">{errors.password}</div>
          )}
        </Form.Group>
      </Col>

      {/* Confirm Password */}
      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-semibold text-muted">
            {t('password_confirm')}
          </Form.Label>
          <InputGroup>
            <Form.Control
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`rounded-start-3 bg-light border-0 py-2 ${errors?.confirmPassword ? "is-invalid" : ""}`}
              placeholder={t('password_confirm_placeholder')}
            />
            <Button
              variant="light"
              className={`border-0 bg-light rounded-end-3 ${errors?.confirmPassword ? "border-danger" : ""}`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ zIndex: 0 }}
            >
              {showConfirmPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </Button>
          </InputGroup>
          {errors?.confirmPassword && (
            <div className="text-danger small mt-1">
              {errors.confirmPassword}
            </div>
          )}
        </Form.Group>
      </Col>

      {/* Region */}
      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-semibold text-muted">{t('region')}</Form.Label>
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
          <Form.Label className="fw-semibold text-muted">{t('native_language')}</Form.Label>
          <Form.Select
            name="nativeLang"
            value={formData.nativeLang}
            onChange={handleChange}
            className="rounded-3 bg-light border-0 py-2"
          >
            <option value="한국어">{t('lang_ko')}</option>
            <option value="중국어">{t('lang_zh')}</option>
            <option value="베트남어">{t('lang_vi')}</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Preferred Language */}
      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-semibold text-muted">
            {t('preferred_language')}
          </Form.Label>
          <Form.Select
            name="preferredLang"
            value={formData.preferredLang}
            onChange={handleChange}
            className="rounded-3 bg-light border-0 py-2"
          >
            <option value="한국어">{t('lang_ko')}</option>
            <option value="중국어">{t('lang_zh')}</option>
            <option value="베트남어">{t('lang_vi')}</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Entry Date */}
      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-semibold text-muted">
            {t('entry_date')}
          </Form.Label>
          <Form.Control
            type="date"
            name="entryDate"
            value={formData.entryDate}
            onChange={handleChange}
            className="rounded-3 bg-light border-0 py-2"
          />
        </Form.Group>
      </Col>
    </Row>
  );
};

export default EditForm;