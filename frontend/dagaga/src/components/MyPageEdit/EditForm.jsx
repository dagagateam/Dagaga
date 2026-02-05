import React, { useState } from "react";
import { Row, Col, Form, InputGroup } from "react-bootstrap";
import RegionSelect from "../common/RegionSelect.jsx";
import PasswordToggleButton from "../common/PasswordToggleButton";
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
            <PasswordToggleButton
              showPassword={showPassword}
              onClick={() => setShowPassword(!showPassword)}
              isError={!!errors?.password}
              className="border-0 bg-light rounded-end-3"
            />
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
            <PasswordToggleButton
              showPassword={showConfirmPassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              isError={!!errors?.confirmPassword}
              className="border-0 bg-light rounded-end-3"
            />
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
            <option value="中文">{t('lang_zh')}</option>
            <option value="Việt Nam">{t('lang_vi')}</option>
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
            <option value="中文">{t('lang_zh')}</option>
            <option value="Việt Nam">{t('lang_vi')}</option>
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