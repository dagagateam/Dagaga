import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Modal, Button } from 'react-bootstrap';
import './CommunityChatRoom.css';
import chattingTiger from '../../../assets/characters/chat_tiger2.webp';
import restrictedTiger from '../../../assets/characters/tiger_oops.png';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmojiPicker from 'emoji-picker-react';
import ChatMessage from '../../../components/community/chat/ChatMessage';
import { fetchChatMessages, fetchJoinedChats, leaveChatRoom } from '../../../api/communityApi';
import { useUserStore } from '../../../store/userStore';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import stockProfile from '../../../assets/icons/stock_profile.jpg';
// import exitIcon from '../../../assets/icons/exit_icon.png'; // Removed as unused
import { deleteChatRoom } from '../../../api/communityApi';

const CommunityChatRoom = () => {
    const { t, i18n } = useTranslation();
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
    const [showMenu, setShowMenu] = useState(false); // Menu dropdown state
    const menuRef = React.useRef(null);
    const stompClient = React.useRef(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);


    const { user, accessToken } = useUserStore();

    const currentUserId = user?.userId || 27;
    const userLocationId = user?.locationId || 86;

    const [joinedChats, setJoinedChats] = useState([]);
    const [currentRoomInfo, setCurrentRoomInfo] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id || !user?.userId) return;

            setLoading(true);
            setAccessDenied(false);

            try {
                const [joinedResult, messagesResult] = await Promise.allSettled([
                    fetchJoinedChats(),
                    fetchChatMessages(id)
                ]);

                if (joinedResult.status === 'fulfilled') {
                    const response = joinedResult.value;
                    const joinedData = Array.isArray(response) ? response : response.data;

                    if (joinedData && Array.isArray(joinedData)) {
                        const mappedChats = joinedData.map(chat => ({
                            id: chat.roomId,
                            title: chat.title,
                            creatorNickname: chat.creatorNickname,
                            lastMessage: t('check_msg'),
                            time: '',
                            active: parseInt(id) === chat.roomId
                        }));
                        setJoinedChats(mappedChats);

                        const currentRoom = joinedData.find(chat => parseInt(id) === chat.roomId);
                        if (currentRoom) {
                            const creatorId = currentRoom.creatorId || currentRoom.hostId || currentRoom.userId;
                            setCurrentRoomInfo({
                                title: currentRoom.title,
                                creatorNickname: currentRoom.creatorNickname,
                                creatorProfileImage: currentRoom.creatorProfileImage,
                                participantCount: currentRoom.participantCount,
                                creatorId: creatorId,
                                isCreator: (creatorId && creatorId === user?.userId) || 
                                          (currentRoom.creatorNickname && currentRoom.creatorNickname === user?.nickname)
                            });
                        }
                    }
                } else {
                    console.error("Failed to load joined chats:", joinedResult.reason);
                }

                if (messagesResult.status === 'fulfilled') {
                    const apiMessages = messagesResult.value;
                    const mappedMessages = apiMessages.map(msg => ({
                        id: msg.messageId,
                        sender: msg.senderNickname || `User ${msg.senderId}`,
                        senderId: msg.senderId,
                        text: (msg.senderId === currentUserId && msg.originalContent) ? msg.originalContent : msg.content,
                        time: new Date(msg.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                        isMe: msg.senderId === currentUserId,
                        profileImage: msg.senderProfileImage,
                        type: 'text',
                        sentAt: msg.sentAt
                    })).reverse();
                    setMessages(mappedMessages);
                } else {
                    const error = messagesResult.reason;
                    console.error("Failed to load chat messages:", error);
                    if (error.response && (error.response.status === 403 || error.response.status === 401 || error.response.status === 500)) {
                         setAccessDenied(true);
                    } else {
                         setAccessDenied(true);
                    }
                }
            } catch (uncaughtError) {
                console.error("Unexpected error in loadData:", uncaughtError);
            } finally {
                setLoading(false);
            }
        };

        if (id && user?.userId) {
            loadData();
        }
    }, [id, user?.userId, user?.nickname]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

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
            
            // Close menu if clicked outside
            if (showMenu && menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker, showMenu]);

    // WebSocket Connection
    useEffect(() => {
        if (!id || !user?.userId || !accessToken) return;

        // console.log('Initiating WebSocket connection...');

        // 백엔드 URL 결정 (환경 변수 또는 기본값)
        // 로컬 테스트 시 .env에 VITE_BACKEND_URL=http://localhost:8080 추가 권장
        const baseURL = import.meta.env.VITE_BACKEND_URL || 'https://i14b110.p.example.io';
        const wsURL = baseURL.replace(/^http/, 'ws') + '/ws-chat';

        // console.log('Connecting to WebSocket URL:', wsURL);

        const client = new Client({
            webSocketFactory: () => new SockJS(baseURL + '/ws-chat'),
            connectHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },
            // debug: function (str) {
            //     console.log('STOMP: ' + str);
            // },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: (frame) => {
                // console.log('STOMP Connected: ' + frame);

                // Subscribe to room messages (언어별 채널 구독)
                const userNativeLang = user?.nativeLangCode || 'ko';
                client.subscribe(`/sub/chat/rooms/${id}/${userNativeLang}`, (message) => {
                    if (message.body) {
                        try {
                            const receivedMsg = JSON.parse(message.body);
                            // console.log('Received message:', receivedMsg);

                            const newMsg = {
                                id: receivedMsg.messageId,
                                sender: receivedMsg.senderNickname || `User ${receivedMsg.senderId}`,
                                senderId: receivedMsg.senderId,
                                text: (receivedMsg.senderId === user.userId && receivedMsg.originalContent) ? receivedMsg.originalContent : receivedMsg.content,
                                time: new Date(receivedMsg.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                                isMe: receivedMsg.senderId === user.userId,
                                profileImage: receivedMsg.senderProfileImage,
                                profileImage: receivedMsg.senderProfileImage,
                                type: 'text',
                                sentAt: receivedMsg.sentAt // Store original date
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

                // Subscribe to user specific errors
                client.subscribe('/user/queue/errors', (message) => {
                    if (message.body) {
                        setErrorMessage(message.body);
                        setShowErrorModal(true);
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
                // console.log('Deactivating STOMP client...');
                client.deactivate();
            }
        };
    }, [id, user?.userId, accessToken]);

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
                
                // Reset textarea height
                if (document.querySelector('.chat-input-area textarea')) {
                    document.querySelector('.chat-input-area textarea').style.height = 'auto';
                }
                
                // 메시지는 구독 콜백을 통해 UI에 추가됨
            } catch (error) {
                console.error('Failed to send message via STOMP:', error);
                alert(t('msg_send_failed'));
            }
        } else {
            console.warn('STOMP client is not connected.');
            alert(t('chat_server_disconnected'));
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
                text: t('sent_photo'),
                image: imageUrl,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                isMe: true,
                type: 'image',
                sentAt: new Date().toISOString() // Current time for separator logic
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
        if (window.confirm(t('confirm_leave_chat'))) {
            try {
                await leaveChatRoom(id);
                navigate('/community/chat');
            } catch (error) {
                alert(t('leave_chat_failed'));
                console.error(error);
            }
        }
    };

    const handleDeleteChat = async () => {
        if (window.confirm(t('confirm_delete_chat'))) {
            try {
                await deleteChatRoom(id);
                navigate('/community/chat');
            } catch (error) {
                alert(t('delete_chat_failed'));
                console.error(error);
            }
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

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
                        {accessDenied ? (
                            <div className="restricted-access-view">
                                <img src={restrictedTiger} alt="Access Denied" className="restricted-tiger-img" />
                                <h3>{t('restricted_access_title') || '거주 지역 내의 채팅방에만 참여 가능해요'}</h3>
                                <button className="btn-primary" onClick={() => navigate('/community/chat')}>
                                    {t('go_back_to_list') || '목록으로 돌아가기'}
                                </button>
                            </div>
                        ) : (
                            <>
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
                                    <div style={{ position: 'relative' }} ref={menuRef}>
                                        <button 
                                            className="menu-btn" 
                                            onClick={() => setShowMenu(!showMenu)} 
                                            title="메뉴"
                                        >
                                            &#8942; {/* Vertical Ellipsis */}
                                        </button>
                                        {showMenu && (
                                            <div className="chat-menu-dropdown">
                                                <button onClick={handleLeaveChat} className="menu-item">
                                                    {t('chat_room_leave')}
                                                </button>
                                                {/* Show delete button if isCreator is true */}
                                                {currentRoomInfo?.isCreator && (
                                                    <button onClick={handleDeleteChat} className="menu-item delete-item">
                                                        {t('chat_room_delete')}
                                                    </button>
                                                )}
                                            </div>
                                        )}
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

                                        // Date Separator Logic
                                        const currentDate = new Date(msg.sentAt);
                                        const dateString = currentDate.toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
                                        
                                        let showDateSeparator = false;
                                        if (index === 0) {
                                            showDateSeparator = true;
                                        } else {
                                            const prevDate = new Date(messages[index - 1].sentAt);
                                            if (currentDate.toDateString() !== prevDate.toDateString()) {
                                                showDateSeparator = true;
                                            }
                                        }

                                        return (
                                            <React.Fragment key={msg.id}>
                                                {showDateSeparator && (
                                                    <div className="chat-date-separator">
                                                        {dateString}
                                                    </div>
                                                )}
                                                <ChatMessage msg={msg} showAvatar={showAvatar} showTime={showTime} />
                                            </React.Fragment>
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
                                    <textarea
                                        rows={1}
                                        placeholder={t('send_msg')}
                                        value={message}
                                        onChange={(e) => {
                                            setMessage(e.target.value);
                                            e.target.style.height = 'auto'; // Reset height
                                            e.target.style.height = `${e.target.scrollHeight}px`; // Set new height
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.nativeEvent.isComposing) return; // Prevent double trigger during IME composition
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                                e.target.style.height = 'auto'; // Reset height after send
                                            }
                                        }}
                                        style={{
                                            resize: 'none',
                                            overflowY: message.split('\n').length > 3 || (document.querySelector('.chat-input-area textarea') && document.querySelector('.chat-input-area textarea').scrollHeight > 80) ? 'auto' : 'hidden'
                                        }}
                                    />
                                    <div className="input-actions">
                                        <button type="button" className="emoji-btn" style={{ fontSize: '1.5rem', marginRight: '10px' }} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>☺</button>
                                        <button type="submit" className="send-btn">
                                            ➤
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </Container>

            <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t('notice')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {t(errorMessage)}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowErrorModal(false)}>
                        {t('confirm')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CommunityChatRoom;
