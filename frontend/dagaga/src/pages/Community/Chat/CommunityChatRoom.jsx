import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './CommunityChatRoom.css';
import chattingTiger from '../../../assets/characters/chat_tiger2.png';
import EmojiPicker from 'emoji-picker-react';
import ChatMessage from '../../../components/community/chat/ChatMessage';
import { fetchChatMessages, fetchJoinedChats, leaveChatRoom } from '../../../api/communityApi';
import { useUserStore } from '../../../store/userStore';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import stockProfile from '../../../assets/icons/stock_profile.jpg';

const CommunityChatRoom = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = React.useRef(null);
    const messagesEndRef = React.useRef(null);
    const emojiPickerRef = React.useRef(null);
    const emojiBtnRef = React.useRef(null);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [messages, setMessages] = useState([]);
    const stompClient = React.useRef(null);


    const { user, accessToken } = useUserStore();

    const currentUserId = user?.userId || 27;
    const userLocationId = user?.locationId || 86;

    useEffect(() => {
        const loadMessages = async () => {
            // Basic implementation: fetch messages when room ID changes
            if (id) {
                try {
                    const apiMessages = await fetchChatMessages(id);
                    // Map API response to UI model if necessary
                    // API returns: { messageId, senderId, senderNickname, senderProfileImage, originalText, sentAt, ... }
                    // UI expects: { id, sender, text, time, isMe, profileImage }
                    const mappedMessages = apiMessages.map(msg => ({
                        id: msg.messageId,
                        sender: msg.senderNickname || `User ${msg.senderId}`,
                        senderId: msg.senderId,
                        text: msg.content,
                        time: new Date(msg.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                        isMe: msg.senderId === currentUserId,
                        profileImage: msg.senderProfileImage,
                        type: 'text'
                    })).reverse(); // 최신 메시지가 아래에 오도록 정렬 순서 반전
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showEmojiPicker &&
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                emojiBtnRef.current &&
                !emojiBtnRef.current.contains(event.target)
            ) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    // WebSocket Connection
    useEffect(() => {
        if (!id || !user?.userId || !accessToken) return;

        console.log('Initiating WebSocket connection...');

        // 백엔드 URL 결정 (환경 변수 또는 기본값)
        // 로컬 테스트 시 .env에 VITE_BACKEND_URL=http://localhost:8080 추가 권장
        const baseURL = import.meta.env.VITE_BACKEND_URL || 'https://i14b110.p.ssafy.io';
        const wsURL = baseURL.replace(/^http/, 'ws') + '/ws-chat';

        console.log('Connecting to WebSocket URL:', wsURL);

        const client = new Client({
            webSocketFactory: () => new SockJS(baseURL + '/ws-chat'),
            connectHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },
            debug: function (str) {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: (frame) => {
                console.log('STOMP Connected: ' + frame);

                // Subscribe to room messages (언어별 채널 구독)
                const userNativeLang = user?.nativeLangCode || 'ko';
                client.subscribe(`/sub/chat/rooms/${id}/${userNativeLang}`, (message) => {
                    if (message.body) {
                        try {
                            const receivedMsg = JSON.parse(message.body);
                            console.log('Received message:', receivedMsg);

                            const newMsg = {
                                id: receivedMsg.messageId,
                                sender: receivedMsg.senderNickname || `User ${receivedMsg.senderId}`,
                                senderId: receivedMsg.senderId,
                                text: receivedMsg.content, // 백엔드에서 이미 적절한 언어로 필터링되어 옴
                                time: new Date(receivedMsg.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                                isMe: receivedMsg.senderId === user.userId,
                                profileImage: receivedMsg.senderProfileImage,
                                type: 'text'
                            };

                            setMessages((prev) => {
                                // 중복 방지 (ID 기준)
                                if (prev.some(m => m.id === newMsg.id)) return prev;
                                // 최신 메시지가 아래에 오도록 정렬 순서 유지 (기존 reverse()와 매칭)
                                return [...prev, newMsg];
                            });
                        } catch (e) {
                            console.error('Failed to parse message body:', e);
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        stompClient.current = client;

        return () => {
            if (client) {
                console.log('Deactivating STOMP client...');
                client.deactivate();
            }
        };
    }, [id, user?.userId, accessToken]);

    const [joinedChats, setJoinedChats] = useState([]);
    const [currentRoomInfo, setCurrentRoomInfo] = useState(null);

    // Fetch joined chats for sidebar
    useEffect(() => {
        const loadJoinedChats = async () => {
            if (user?.userId) {
                try {
                    const response = await fetchJoinedChats();
                    const joinedData = Array.isArray(response) ? response : response.data;

                    if (joinedData && Array.isArray(joinedData)) {
                        const mappedChats = joinedData.map(chat => ({
                            id: chat.roomId,
                            title: chat.title,
                            creatorNickname: chat.creatorNickname,
                            lastMessage: t('check_msg'), // TODO: 마지막 메시지 API 추가 필요
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

        if (stompClient.current && stompClient.current.connected) {
            try {
                // STOMP를 통해 메시지 전송
                stompClient.current.publish({
                    destination: '/pub/chat/message',
                    body: JSON.stringify({
                        roomId: parseInt(id), // ID must be integer
                        originalText: message.trim()
                    })
                });
                setMessage('');
                // 메시지는 구독 콜백을 통해 UI에 추가됨
            } catch (error) {
                console.error('Failed to send message via STOMP:', error);
                alert('메시지 전송에 실패했습니다. (Socket Error)');
            }
        } else {
            console.warn('STOMP client is not connected.');
            alert('채팅 서버에 연결되어 있지 않습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            const newMsg = {
                id: Date.now(),
                sender: '나',
                senderId: currentUserId,
                text: '사진을 보냈습니다.',
                image: imageUrl,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
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

    const handleLeaveChat = async () => {
        if (window.confirm("채팅방을 나가시겠습니까?")) {
            try {
                await leaveChatRoom(id);
                // 성공 시 이동 (WebSocket 해제는 useEffect cleanup에서 처리됨)
                navigate('/community/chat');
            } catch (error) {
                alert('채팅방 나가기에 실패했습니다.');
                console.error(error);
            }
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
                            <button
                                className="sidebar-back-btn"
                                onClick={() => navigate('/community/chat')}
                                title="목록으로 돌아가기"
                            >
                                ←
                            </button>
                            <h3>{t('participating_chat_rooms')}</h3>
                        </div>

                        <div className="sidebar-search">
                            <input
                                type="text"
                                placeholder={t('search_chat_name')}
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
                                <img
                                    src={(!currentRoomInfo?.creatorProfileImage || currentRoomInfo.creatorProfileImage.includes('default_avatar'))
                                        ? stockProfile
                                        : currentRoomInfo.creatorProfileImage}
                                    alt="User"
                                    className="header-avatar"
                                    onError={(e) => { e.target.src = stockProfile }}
                                />
                                <div>
                                    <div className="header-username">{currentRoomInfo?.creatorNickname}</div>
                                    <div className="header-user-status">{t('room_manager')}👑</div>
                                </div>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <button className="leave-chat-btn" onClick={handleLeaveChat}>
                                    {t('chat_room_leave')}
                                </button>
                            </div>
                        </div>

                        <div className="chat-messages-area">
                            {messages.map((msg, index) => {
                                // Simple logic to show avatar only for first message in sequence or non-me messages
                                const prevMsg = index > 0 ? messages[index - 1] : null;
                                const isDifferentSenderThanPrev = prevMsg ? (prevMsg.senderId !== msg.senderId) : true;
                                const showAvatar = !msg.isMe && isDifferentSenderThanPrev;
                                
                                // Show time logic: Show if it's the last message, or next message is different time/sender
                                const isLast = index === messages.length - 1;
                                const nextMsg = !isLast ? messages[index + 1] : null;
                                const isDifferentSenderThanNext = nextMsg ? (nextMsg.senderId !== msg.senderId) : true;
                                const isDifferentTimeThanNext = nextMsg ? (nextMsg.time !== msg.time) : true;
                                
                                const showTime = isLast || isDifferentSenderThanNext || isDifferentTimeThanNext;

                                return (
                                    <ChatMessage key={msg.id} msg={msg} showAvatar={showAvatar} showTime={showTime} />
                                );
                            })}

                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            {showEmojiPicker && (
                                <div className="emoji-picker-container" ref={emojiPickerRef}>
                                    <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder={t('send_msg')}
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
                                <button ref={emojiBtnRef} type="button" className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>☺</button>
                            </div>
                        </form>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CommunityChatRoom;
