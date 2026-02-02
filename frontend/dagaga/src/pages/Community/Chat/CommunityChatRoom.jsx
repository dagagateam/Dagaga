import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './CommunityChatRoom.css';
import chattingTiger from '../../../assets/characters/chat_tiger.png';
import EmojiPicker from 'emoji-picker-react';
import ChatMessage from '../../../components/community/Chat/ChatMessage';
import { fetchChatMessages, fetchJoinedChats, sendChatMessage } from '../../../api/communityApi';
import { useUserStore } from '../../../store/userStore';

const CommunityChatRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);
    const messagesEndRef = React.useRef(null);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [messages, setMessages] = useState([]);
    
    // Get user data from store (or use test data for now)
    const { user } = useUserStore();
    // Test user data: userId: 27, locationId: 86, nickname: "오호라비비빅"
    const currentUserId = user?.userId || 27;
    const userLocationId = user?.locationId || 86;

    useEffect(() => {
        const loadMessages = async () => {
             // Basic implementation: fetch messages when room ID changes
             if (id) {
                 try {
                     const apiMessages = await fetchChatMessages(id, userLocationId);
                     // Map API response to UI model if necessary
                     // API returns: { messageId, senderId, originalText, sentAt, ... }
                     // UI expects: { id, sender, text, time, isMe }
                     // We need to fetch user info or infer 'isMe'. For now assume senderId 123 is 'me' (this needs real user ID later)
                     const mappedMessages = apiMessages.map(msg => ({
                         id: msg.messageId,
                         sender: msg.senderId === currentUserId ? '나' : `User ${msg.senderId}`,
                         text: msg.originalText,
                         time: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                         isMe: msg.senderId === currentUserId,
                         type: 'text'
                     }));
                     setMessages(mappedMessages);
                 } catch (error) {
                     console.error("Failed to fetch chat messages:", error);
                 }
             }
        };
        loadMessages();
    }, [id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const [joinedChats, setJoinedChats] = useState([]);
    const [currentRoomInfo, setCurrentRoomInfo] = useState(null);

    // Fetch joined chats for sidebar
    useEffect(() => {
        const loadJoinedChats = async () => {
            if (user?.userId) {
                try {
                    const response = await fetchJoinedChats(user.userId);
                    const joinedData = Array.isArray(response) ? response : response.data;
                    
                    if (joinedData && Array.isArray(joinedData)) {
                        const mappedChats = joinedData.map(chat => ({
                            id: chat.roomId,
                            title: chat.title,
                            creatorNickname: chat.creatorNickname,
                            lastMessage: '메시지를 확인하세요', // TODO: 마지막 메시지 API 추가 필요
                            time: '', // TODO: 시간 정보 API 추가 필요
                            active: parseInt(id) === chat.roomId
                        }));
                        setJoinedChats(mappedChats);
                        
                        // Set current room info
                        const currentRoom = joinedData.find(chat => parseInt(id) === chat.roomId);
                        if (currentRoom) {
                            setCurrentRoomInfo({
                                title: currentRoom.title,
                                creatorNickname: currentRoom.creatorNickname,
                                participantCount: currentRoom.participantCount
                            });
                        }
                    }
                } catch (error) {
                    console.error('Failed to load joined chats:', error);
                }
            }
        };
        loadJoinedChats();
    }, [user?.userId, id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            // Send message to API
            await sendChatMessage(id, currentUserId, message.trim(), userLocationId);
            
            // Add message to local state for immediate display
            const newMsg = {
                id: Date.now(),
                sender: '나',
                text: message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true,
                type: 'text'
            };
            setMessages([...messages, newMsg]);
            setMessage('');
            
            // Optionally reload messages from API to get server-side data
            // const apiMessages = await fetchChatMessages(id, userLocationId);
            // ... map and setMessages
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            const newMsg = {
                id: Date.now(),
                sender: '나',
                text: '사진을 보냈습니다.',
                image: imageUrl,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true,
                type: 'image'
            };
            setMessages([...messages, newMsg]);
        }
    };

    const handleClipClick = () => {
        fileInputRef.current.click();
    };

    const onEmojiClick = (emojiObject) => {
        setMessage(prevMsg => prevMsg + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const handleLeaveChat = () => {
        if (window.confirm("채팅방을 나가시겠습니까?")) {
            navigate('/community/chat');
        }
    };

    return (
        <div className="chat-room-container">
            <Container>
                {/* Header for mobile or breadcrumb style navigation could go here */}
                {/* <div className="chat-room-header-nav">
                    <button onClick={() => navigate(-1)}>Back</button>
                    <h2>한국어 공부 같이해요</h2>
                </div> */}

                <div className="chat-layout">
                    {/* Left Sidebar */}
                    <div className="chat-sidebar">
                        <div className="sidebar-header">
                            <h3>현재 참여중이 모임방 <span className="badge-new">2 New</span></h3>

                        </div>

                        <div className="sidebar-search">
                            <input
                                type="text"
                                placeholder="모임방 이름을 검색하세요"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="sidebar-chat-list">
                            {joinedChats
                                .filter(chat => chat.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(chat => (
                                    <div 
                                        key={chat.id} 
                                        className={`sidebar-chat-item ${chat.active ? 'active' : ''}`}
                                        onClick={() => navigate(`/community/chat/room/${chat.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="chat-item-icon">
                                            {/* Placeholder icon based on title chars */}
                                            <div className="chat-item-avatar">{chat.title.substring(0, 2)}</div>
                                        </div>
                                        <div className="chat-item-info">
                                            <div className="chat-item-top">
                                                <span className="chat-item-title">{chat.title}</span>
                                                <span className="chat-item-time">{chat.time}</span>
                                            </div>
                                            <div className="chat-item-msg">{chat.lastMessage}</div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        <div className="sidebar-tiger">
                            <img src={chattingTiger} alt="Tiger" />
                        </div>
                    </div>

                    {/* Right Main Chat Area */}
                    <div className="chat-main">
                        <div className="chat-main-header">
                            <div className="header-user-info">
                                <img src="https://i.pravatar.cc/150?u=creator" alt="User" className="header-avatar" />
                                <div>
                                    <div className="header-username">{currentRoomInfo?.creatorNickname}</div>
                                    <div className="header-user-status">모임방 방장 👑</div>
                                </div>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <button className="more-btn" onClick={() => setShowMoreMenu(!showMoreMenu)}>⋮</button>
                                {showMoreMenu && (
                                    <div className="more-menu-dropdown">
                                        <button className="more-menu-item delete" onClick={handleLeaveChat}>
                                            나가기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="chat-messages-area">
                            {messages.map((msg, index) => {
                                // Simple logic to show avatar only for first message in sequence or non-me messages
                                const showAvatar = !msg.isMe && (index === 0 || messages[index - 1].sender !== msg.sender);
                                return (
                                    <ChatMessage key={msg.id} msg={msg} showAvatar={showAvatar} />
                                );
                            })}

                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            {showEmojiPicker && (
                                <div className="emoji-picker-container">
                                    <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="메세지 보내기"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <div className="input-actions">
                                <button type="button" className="attach-btn" onClick={handleClipClick}>📎</button>
                                <button type="button" className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>☺</button>
                            </div>
                        </form>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CommunityChatRoom;
