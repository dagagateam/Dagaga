import React from 'react';
import { useTranslation } from 'react-i18next';
import './ChatMessage.css';
import stockProfile from '../../../assets/icons/stock_profile.jpg';

const ChatMessage = ({ msg, showAvatar }) => {
    const { t } = useTranslation();
    // Basic fallback logic if msg.profileImage is missing or is 'default_avatar'
    const profileImg = (!msg.profileImage || msg.profileImage.includes('default_avatar'))
        ? stockProfile
        : msg.profileImage;

    return (
        <div className={`message-row ${msg.isMe ? 'my-message' : 'other-message'}`}>
            <div className="message-content-wrapper">
                {!msg.isMe && showAvatar && (
                    <div className="message-avatar">
                        <img src={profileImg} alt={msg.sender} onError={(e) => { e.target.src = stockProfile }} />
                    </div>
                )}
                {!msg.isMe && showAvatar && <div className="message-sender">{msg.sender}</div>}

                <div className="message-bubble">
                    {msg.type === 'image' ? (
                        <img src={msg.image} alt="Uploaded" className="chat-image" style={{ maxWidth: '200px', borderRadius: '10px' }} />
                    ) : (
                        msg.text
                    )}
                </div>
                <div className="message-time">{msg.time}</div>
            </div>
        </div>
    );
};

export default ChatMessage;
