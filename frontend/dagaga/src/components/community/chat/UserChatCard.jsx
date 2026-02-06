import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './UserChatCard.css';
import { joinChatRoom } from '../../../api/communityApi';
import { useUserStore } from '../../../store/userStore';
import stockProfile from '../../../assets/icons/stock_profile.jpg'

const UserChatCard = ({ chat }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [joining, setJoining] = useState(false);

    // Profile image logic
    const avatarSrc = (!chat.avatar || chat.avatar.includes('default_avatar'))
        ? stockProfile
        : chat.avatar;

    const handleJoinChat = async () => {
        if (!user || !user.userId) {
            alert(t('login_required'));
            return;
        }

        setJoining(true);
        try {
            await joinChatRoom(chat.id, user.userId, user.locationId || 86);
            // 참여 성공 후 채팅방으로 이동
            navigate(`/community/chat/room/${chat.id}`);
        } catch (error) {
            console.error('Failed to join chat room:', error);
            alert(t('chat_join_failed'));
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="user-chat-card">
            <div className="chat-card-header">
                <img
                    src={avatarSrc}
                    alt={chat.creator}
                    className="creator-avatar"
                    onError={(e) => { e.target.src = stockProfile }}
                />
                <span className="creator-name">{chat.creator}</span>
            </div>

            <h4 className="chat-title">{chat.title}</h4>

            <div className="chat-card-footer">
                <button
                    className="user-join-btn"
                    onClick={handleJoinChat}
                    disabled={joining}
                >
                    {joining ? t('joining') : t('participate')}
                </button>
                <span className="chat-participants">{chat.participantCount}{t('person_participating')}</span>
            </div>

        </div>
    );
};

export default UserChatCard;
