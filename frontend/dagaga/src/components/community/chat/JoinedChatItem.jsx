import React from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinedChatItem.css';

const JoinedChatItem = ({ chat }) => {
    const navigate = useNavigate();

    return (
        <div className="joined-chat-item">
            <div className="joined-chat-info">
                <span className="joined-chat-title">{chat.title}</span>
                <span className="joined-chat-count">{chat.count}명</span>
            </div>
            <button className="enter-btn" onClick={() => navigate(`/Community/Chat/room/${chat.id}`)}>
                입장
            </button>
        </div>
    );
};

export default JoinedChatItem;
