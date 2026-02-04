import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';
import errorTiger from '../../assets/characters/error_tiger.png';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-inner">
                <div className="not-found-image">
                    <img src={errorTiger} alt="Page not found" />
                </div>
                
                <div className="not-found-text-content">
                    <h1 className="not-found-title">Not Found</h1>
                    
                    <div className="not-found-desc">
                        <p className="desc-main">죄송합니다. 페이지를 찾을 수 없습니다.</p>
                        <p className="desc-sub">
                            존재하지 않는 주소를 입력하셨거나,<br/>
                            요청하신 페이지의 주소가 변경, 삭제되어 찾을 수 없습니다.
                        </p>
                    </div>

                    <button className="go-home-link" onClick={() => navigate('/')}>
                        홈으로
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
