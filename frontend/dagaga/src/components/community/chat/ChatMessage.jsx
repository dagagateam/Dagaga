import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ msg, showAvatar }) => {
    return (
        <div className={`message-row ${msg.isMe ? 'my-message' : 'other-message'}`}>
            <div className="message-content-wrapper">
                {!msg.isMe && showAvatar && (
                    <div className="message-avatar">
                        <img src="https://i.pravatar.cc/150?u=hanna" alt={msg.sender} />
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
