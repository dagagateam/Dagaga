import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserChatCard.css';

const UserChatCard = ({ chat }) => {
    const navigate = useNavigate();

    return (
        <div className="user-chat-card">
            <div className="chat-card-header">
                <div className="header-left-group">
                    <img src={chat.avatar} alt={chat.creator} className="creator-avatar" />
                    <span className="creator-name">{chat.creator}</span>
                </div>
                <button className="user-join-btn" onClick={() => navigate(`/community/chat/room/${chat.id}`)}>참여하기</button>
            </div>
            <div className="chat-card-body">
                <div className="chat-card-thm-wrapper">
                    <img src={chat.image} alt={chat.title} className="chat-card-thm" />
                </div>
                <div className="chat-card-info">
                    <span className="chat-participants">{chat.participantCount}명 참여중</span>
                    <h4 className="chat-title">{chat.title}</h4>
                </div>
            </div>
        </div>
    );
};

export default UserChatCard;
