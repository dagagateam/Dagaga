import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserChatCard.css';
import { joinChatRoom } from '../../../api/communityApi';
import { useUserStore } from '../../../store/userStore';

const UserChatCard = ({ chat }) => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [joining, setJoining] = useState(false);

    const handleJoinChat = async () => {
        if (!user || !user.userId) {
            alert('로그인이 필요합니다.');
            return;
        }

        setJoining(true);
        try {
            await joinChatRoom(chat.id, user.userId, user.locationId || 86);
            // 참여 성공 후 채팅방으로 이동
            navigate(`/community/chat/room/${chat.id}`);
        } catch (error) {
            console.error('Failed to join chat room:', error);
            alert('채팅방 참여에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="user-chat-card">
            <div className="chat-card-header">
                <div className="header-left-group">
                    <img src={chat.avatar} alt={chat.creator} className="creator-avatar" />
                    <span className="creator-name">{chat.creator}</span>
                </div>
                <button 
                    className="user-join-btn" 
                    onClick={handleJoinChat}
                    disabled={joining}
                >
                    {joining ? '참여 중...' : '참여하기'}
                </button>
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
