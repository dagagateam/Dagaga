import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Modal } from 'react-bootstrap';
import './CommunityChatList.css';
import { fetchChatRooms, createChatRoom, fetchJoinedChats, fetchChatsByLocation } from '../../../api/communityApi';
import { useUserStore } from '../../../store/userStore';
import UserChatCard from '../../../components/community/Chat/UserChatCard';
import JoinedChatItem from '../../../components/community/Chat/JoinedChatItem';
import Button from '../../../components/Common/Button';

const CommunityChatList = () => {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState({ regionalChat: null, userChats: [] });
    const [locationChats, setLocationChats] = useState([]);
    const [regionalChats, setRegionalChats] = useState([]);
    const [customChats, setCustomChats] = useState([]);
    const [joinedChats, setJoinedChats] = useState([]);
    const [userRegion, setUserRegion] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newChatTitle, setNewChatTitle] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const region = localStorage.getItem('regionName');
        setUserRegion(region || '서울 종로구');

        const loadData = async () => {
            try {
                const response = await fetchChatRooms();
                if (response.data) {
                    setData(response.data);
                }

                // Fetch joined chats if user is logged in
                if (user?.userId) {
                    const joinedResponse = await fetchJoinedChats(user.userId);
                    console.log('Joined chats response:', joinedResponse);
                    
                    // API returns array directly or wrapped in data
                    const joinedData = Array.isArray(joinedResponse) ? joinedResponse : joinedResponse.data;
                    
                    if (joinedData && Array.isArray(joinedData)) {
                        // Map API response to UI format
                        const mappedJoinedChats = joinedData.map(chat => ({
                            id: chat.roomId,
                            title: chat.title,
                            count: chat.participantCount
                        }));
                        console.log('Mapped joined chats:', mappedJoinedChats);
                        setJoinedChats(mappedJoinedChats);
                    }
                }

                // Fetch location-based chats if user is logged in
                if (user?.userId && user?.locationId) {
                    const locationResponse = await fetchChatsByLocation(user.locationId);
                    const locationData = Array.isArray(locationResponse) ? locationResponse : locationResponse.data;
                    
                    if (locationData && Array.isArray(locationData)) {
                        const mappedLocationChats = locationData.map(chat => ({
                            id: chat.roomId,
                            title: chat.title,
                            creator: chat.creatorNickname,
                            participantCount: chat.participantCount,
                            roomType: chat.roomType, // DEFAULT or CUSTOM
                            avatar: `https://i.pravatar.cc/150?u=${chat.roomId}`,
                            image: 'https://via.placeholder.com/150',
                            description: chat.title
                        }));
                        setLocationChats(mappedLocationChats);
                        
                        // Separate by roomType
                        const defaultChats = mappedLocationChats.filter(chat => chat.roomType === 'DEFAULT');
                        const customChatList = mappedLocationChats.filter(chat => chat.roomType === 'CUSTOM');
                        
                        setRegionalChats(defaultChats);
                        setCustomChats(customChatList);
                    }
                }
            } catch (error) {
                console.error("Failed to load chat rooms:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.userId]);

    const filteredUserChats = customChats.filter(chat =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.creator.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateChatRoom = async () => {
        if (!newChatTitle.trim()) {
            alert('채팅방 제목을 입력해주세요.');
            return;
        }

        if (!user || !user.userId) {
            alert('로그인이 필요합니다.');
            return;
        }

        setCreating(true);
        try {
            await createChatRoom(user.userId, newChatTitle.trim());
            // 성공 시 항상 실행
            alert('채팅방이 생성되었습니다!');
            setShowCreateModal(false);
            setNewChatTitle('');
            // 채팅방 목록 새로고침
            const updatedRooms = await fetchChatRooms();
            if (updatedRooms.data) {
                setData(updatedRooms.data);
            }
            // 참여중인 채팅방도 새로고침
            if (user?.userId) {
                const joinedResponse = await fetchJoinedChats(user.userId);
                const joinedData = Array.isArray(joinedResponse) ? joinedResponse : joinedResponse.data;
                
                if (joinedData && Array.isArray(joinedData)) {
                    const mappedJoinedChats = joinedData.map(chat => ({
                        id: chat.roomId,
                        title: chat.title,
                        count: chat.participantCount
                    }));
                    setJoinedChats(mappedJoinedChats);
                }
            }
        } catch (error) {
            console.error('Failed to create chat room:', error);
            alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setCreating(false);
        }
    };

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
                    <Button className="create-chat-btn" onClick={() => setShowCreateModal(true)}>
                        채팅방 생성하기 +
                    </Button>
                </div>

                {/* Regional Chat Section */}
                {/* Top Section: Regional Chat + Joined Chats */}
                <div className="top-section-layout">
                    {/* Left: Regional Chat (DEFAULT type) */}
                    {regionalChats && regionalChats.length > 0 && (
                        <div className="regional-chat-section">
                            <div className="regional-chat-card">
                                <div className="regional-card-content">
                                    <h3 className="regional-card-title">{regionalChats[0].title}</h3>
                                    <div>
                                        <Button className="join-btn" onClick={() => navigate(`/community/chat/room/${regionalChats[0].id}`)}>
                                            참여하기
                                        </Button>
                                        <span className="participant-info">{regionalChats[0].participantCount}명 참여중</span>
                                    </div>
                                </div>
                                <div className="regional-card-image">
                                    <img src={regionalChats[0].image} alt={regionalChats[0].title} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right: Joined Chats */}
                    <div className="joined-chats-section">
                        <h3 className="section-title">참여중인 채팅방</h3>
                        <div className="joined-chats-list">
                            {joinedChats && joinedChats.length > 0 ? (
                                joinedChats.map(chat => (
                                    <JoinedChatItem key={chat.id} chat={chat} />
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
                                <UserChatCard key={chat.id} chat={chat} />
                            ))
                        ) : (
                            <div className="text-center py-5 w-100">검색 결과가 없습니다.</div>
                        )}
                    </div>
                </div>
            </Container>

            {/* Create Chat Room Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>새 채팅방 만들기</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label htmlFor="chatTitle" className="form-label">채팅방 제목</label>
                        <input
                            type="text"
                            id="chatTitle"
                            className="form-control"
                            placeholder="채팅방 제목을 입력하세요"
                            value={newChatTitle}
                            onChange={(e) => setNewChatTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateChatRoom()}
                            disabled={creating}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={creating}>
                        취소
                    </Button>
                    <Button onClick={handleCreateChatRoom} disabled={creating}>
                        {creating ? '생성 중...' : '생성하기'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CommunityChatList;
