import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const EditFormFields = ({ formData, onChange }) => {
    const { t } = useTranslation();

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
                        onChange={onChange}
                        className="rounded-3 bg-light border-0 py-2"
                        placeholder={t('nickname_placeholder')}
                    />
                </Form.Group>
            </Col>

            {/* Password */}
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold text-muted">{t('password')}</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        className="rounded-3 bg-light border-0 py-2"
                        placeholder={t('password_requirements')}
                    />
                </Form.Group>
            </Col>

            {/* Region */}
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-semibold text-muted">{t('region')}</Form.Label>
                    <Form.Control
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={onChange}
                        className="rounded-3 bg-light border-0 py-2"
                        placeholder={t('region_placeholder')}
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
                        onChange={onChange}
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
                    <Form.Label className="fw-semibold text-muted">{t('preferred_language')}</Form.Label>
                    <Form.Select
                        name="preferredLang"
                        value={formData.preferredLang}
                        onChange={onChange}
                        className="rounded-3 bg-light border-0 py-2"
                    >
                        <option value="한국어">{t('lang_ko')}</option>
                        <option value="중국어">{t('lang_zh')}</option>
                        <option value="베트남어">{t('lang_vi')}</option>
                    </Form.Select>
                </Form.Group>
            </Col>
        </Row>
    );
};

export default EditFormFields;
