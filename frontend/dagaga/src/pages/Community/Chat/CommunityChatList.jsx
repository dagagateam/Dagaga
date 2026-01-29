import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './CommunityChatList.css';
import { fetchChatRooms } from '../../../api/communityApi';

const CommunityChatList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState({ regionalChat: null, userChats: [] });
    const [userRegion, setUserRegion] = useState('');

    useEffect(() => {
        const region = localStorage.getItem('regionName');
        setUserRegion(region || '서울 종로구');

        const loadData = async () => {
            try {
                const response = await fetchChatRooms();
                if (response.data) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Failed to load chat rooms:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredUserChats = data.userChats.filter(chat => 
        chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.creator.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-5">Loading...</div>;

    return (
        <div className="community-chat-container">
            <Container>
                {/* Header */}
                <div className="chat-header">
                    <h2>
                        채팅방 
                        <span className="chat-location-badge">📍 {userRegion}</span>
                    </h2>
                    <button className="create-chat-btn" onClick={() => alert('채팅방 생성 기능은 준비 중입니다.')}>
                        채팅방 생성하기 +
                    </button>
                </div>

                {/* Regional Chat Section */}
                {/* Top Section: Regional Chat + Joined Chats */}
                <div className="top-section-layout">
                    {/* Left: Regional Chat */}
                    {data.regionalChat && (
                        <div className="regional-chat-section">
                            <div className="regional-chat-card">
                                <div className="regional-card-content">
                                    <h3 className="regional-card-title">{data.regionalChat.title}</h3>
                                    <div>
                                        <button className="join-btn" onClick={() => alert(`${data.regionalChat.title}에 입장합니다.`)}>
                                            참여하기
                                        </button>
                                        <span className="participant-info">{data.regionalChat.participantCount}명 참여중</span>
                                    </div>
                                </div>
                                <div className="regional-card-image">
                                    <img src={data.regionalChat.image} alt={data.regionalChat.title} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right: Joined Chats */}
                    <div className="joined-chats-section">
                        <h3 className="section-title">참여중인 채팅방</h3>
                        <div className="joined-chats-list">
                            {data.joinedChats && data.joinedChats.length > 0 ? (
                                data.joinedChats.map(chat => (
                                    <div key={chat.id} className="joined-chat-item">
                                        <div className="joined-chat-info">
                                            <span className="joined-chat-title">{chat.title}</span>
                                            <span className="joined-chat-count">{chat.count}명</span>
                                        </div>
                                        <button className="enter-btn">입장</button>
                                    </div>
                                ))
                            ) : (
                                <div className="no-joined-chats">참여중인 채팅방이 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Chat Section */}
                <div className="user-chat-section">
                    <div className="user-chat-header">
                        <span className="section-label-badge" style={{ marginBottom: 0 }}>사용자 채팅방</span>
                        <input 
                            type="text" 
                            className="chat-search-input" 
                            placeholder="검색어를 입력하세요" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="user-chat-grid">
                        {filteredUserChats.length > 0 ? (
                            filteredUserChats.map(chat => (
                                <div key={chat.id} className="user-chat-card">
                                    <div className="chat-card-header">
                                        <div className="header-left-group">
                                            <img src={chat.avatar} alt={chat.creator} className="creator-avatar" />
                                            <span className="creator-name">{chat.creator}</span>
                                        </div>
                                        <button className="user-join-btn" onClick={() => alert(`${chat.title}에 참여합니다.`)}>참여하기</button>
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
                            ))
                        ) : (
                            <div className="text-center py-5 w-100">검색 결과가 없습니다.</div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CommunityChatList;
