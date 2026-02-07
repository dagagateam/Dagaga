import React from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import loadingGif from '../../assets/loading/loading 1.gif'; // Reusing the valid asset

const LoadingSpinner = ({ text }) => {
    const { t } = useTranslation();
    
    return (
        <Container 
            fluid 
            className="d-flex justify-content-center align-items-center" 
            style={{ height: '100vh', flexDirection: 'column', backgroundColor: '#f8f9fa' }}
        >
            <img 
                src={loadingGif} 
                alt="Loading..." 
                style={{ width: '150px', height: '150px', objectFit: 'contain' }} 
            />
            <div style={{ marginTop: '20px', fontSize: '1.2rem', color: '#666', fontWeight: '500' }}>
                {text || t('loading', 'Loading...')}
            </div>
        </Container>
    );
};

export default LoadingSpinner;
