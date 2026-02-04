import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './JoinedChatItem.css';

const JoinedChatItem = ({ chat }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="joined-chat-item">
            <div className="joined-chat-info">
                <span className="joined-chat-title">{chat.title}</span>
                <span className="joined-chat-count">{chat.count}{t('person_count')}</span>
            </div>
            <button className="enter-btn" onClick={() => navigate(`/Community/Chat/room/${chat.id}`)}>
                {t('enter')}
            </button>
        </div>
    );
};

export default JoinedChatItem;
