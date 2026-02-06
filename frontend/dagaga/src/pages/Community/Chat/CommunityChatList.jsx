import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container, Modal } from 'react-bootstrap';
import './CommunityChatList.css';
import { createChatRoom, fetchJoinedChats, fetchChatsByLocation } from '../../../api/communityApi';
import { useUserStore } from '../../../store/userStore';
import { getLocationName } from '../../../data/regionData';
import UserChatCard from '../../../components/community/chat/UserChatCard';
import JoinedChatItem from '../../../components/community/chat/JoinedChatItem';
import Button from '../../../components/common/Button';
import LocationBadge from '../../../components/common/LocationBadge';
import regionChatImage from '../../../assets/images/region_chat.png'; // Added import

const CommunityChatList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    // const [data, setData] = useState({ regionalChat: null, userChats: [] }); // Unused
    const [locationChats, setLocationChats] = useState([]);
    const [regionalChats, setRegionalChats] = useState([]);
    const [customChats, setCustomChats] = useState([]);
    const [joinedChats, setJoinedChats] = useState([]);
    const [userRegion, setUserRegion] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newChatTitle, setNewChatTitle] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const regionName = user?.locationId ? getLocationName(user.locationId) : t('region_setup_needed');
        setUserRegion(regionName);

        const loadData = async () => {
            try {
                // Fetch joined chats if user is logged in
                if (user?.userId) {
                    const joinedResponse = await fetchJoinedChats();
                    // DEBUG: Joined chats response
                    // console.log('Joined chats response:', joinedResponse);

                    // API returns array directly or wrapped in data
                    const joinedData = Array.isArray(joinedResponse) ? joinedResponse : joinedResponse.data;

                    if (joinedData && Array.isArray(joinedData)) {
                        // Map API response to UI format
                        const mappedJoinedChats = joinedData.map(chat => ({
                            id: chat.roomId,
                            title: chat.title,
                            participantCount: chat.participantCount
                        }));
                        // DEBUG: Mapped joined chats
                        // console.log('Mapped joined chats:', mappedJoinedChats);
                        setJoinedChats(mappedJoinedChats);
                    }
                }

                // Fetch location-based chats if user is logged in
                if (user?.userId && user?.locationId) {
                    const locationResponse = await fetchChatsByLocation();
                    const locationData = Array.isArray(locationResponse) ? locationResponse : locationResponse.data;

                    if (locationData && Array.isArray(locationData)) {
                        const mappedLocationChats = locationData.map(chat => ({
                            id: chat.roomId,
                            title: chat.title,
                            creator: chat.creatorNickname,
                            participantCount: chat.participantCount,
                            roomType: chat.roomType, // DEFAULT or CUSTOM
                            avatar: chat.creatorProfileImage,
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
            alert(t('input_chat_title_error'));
            return;
        }

        if (!user || !user.userId) {
            alert('로그인이 필요합니다.');
            return;
        }

        setCreating(true);
        setCreating(true);
        try {
            await createChatRoom(newChatTitle.trim());
            // 성공 시 알림
            alert(t('chat_created_success'));
            setShowCreateModal(false);
            setNewChatTitle('');
        } catch (error) {
            console.error('Failed to create chat room:', error);
            alert(t('chat_create_failed'));
            // 생성 실패 시 여기서 종료
            return;
        } finally {
            setCreating(false);
        }

        // 목록 새로고침 (생성 성공 후에만 실행됨)
        try {
            // 채팅방 목록 새로고침 (지역 기반 채팅방)
            if (user?.userId && user?.locationId) {
                const locationResponse = await fetchChatsByLocation();
                const locationData = Array.isArray(locationResponse) ? locationResponse : locationResponse.data;
                if (locationData && Array.isArray(locationData)) {
                    const mappedLocationChats = locationData.map(chat => ({
                        id: chat.roomId,
                        title: chat.title,
                        creator: chat.creatorNickname,
                        participantCount: chat.participantCount,
                        roomType: chat.roomType, // DEFAULT or CUSTOM
                        avatar: chat.creatorProfileImage,
                        description: chat.title
                    }));
                    setLocationChats(mappedLocationChats);

                    const defaultChats = mappedLocationChats.filter(chat => chat.roomType === 'DEFAULT');
                    const customChatList = mappedLocationChats.filter(chat => chat.roomType === 'CUSTOM');

                    setRegionalChats(defaultChats);
                    setCustomChats(customChatList);
                }
            }
            // 참여중인 채팅방도 새로고침
            if (user?.userId) {
                const joinedResponse = await fetchJoinedChats();
                const joinedData = Array.isArray(joinedResponse) ? joinedResponse : joinedResponse.data;

                if (joinedData && Array.isArray(joinedData)) {
                    const mappedJoinedChats = joinedData.map(chat => ({
                        id: chat.roomId,
                        title: chat.title,
                        participantCount: chat.participantCount
                    }));
                    setJoinedChats(mappedJoinedChats);
                }
            }
        } catch (refreshError) {
            console.error('Failed to refresh chat lists after creation:', refreshError);
            // 목록 갱신 실패는 사용자에게 알리지 않거나, 조용히 로그만 남김 (이미 생성은 성공했으므로)
        }
    };



    return (
        <div className="community-chat-container">
            <Container>
                {/* Header */}
                <div className="chat-header">
                    <h2>
                        {t('chat_room')}
                        <LocationBadge region={userRegion} />
                    </h2>
                    <Button className="create-chat-btn" onClick={() => setShowCreateModal(true)}>
                        {t('create_chat_room')}
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
                                    <h3 className="regional-card-title">지역 단체 채팅방</h3>
                                    <div>
                                        <Button className="join-btn" onClick={() => navigate(`/Community/Chat/room/${regionalChats[0].id}`)}>
                                            {t('participate')}
                                        </Button>
                                        <span className="participant-info">{regionalChats[0].participantCount}{t('person_participating')}</span>
                                    </div>
                                </div>
                                <div className="regional-card-image">
                                    <img src={regionChatImage} alt={regionalChats[0].title} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right: Joined Chats */}
                    <div className="joined-chats-section">
                        <h3 className="section-title">{t('participating_chat_rooms')}</h3>
                        <div className="joined-chats-list">
                            {joinedChats && joinedChats.length > 0 ? (
                                joinedChats.map(chat => (
                                    <JoinedChatItem key={chat.id} chat={chat} />
                                ))
                            ) : (
                                <div className="no-joined-chats">{t('no_joined_chats')}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Chat Section */}
                <div className="user-chat-section">
                    <div className="user-chat-header">
                        <span className="section-label-badge" style={{ marginBottom: 0 }}>{t('user_chat_rooms')}</span>
                        <input
                            type="text"
                            className="chat-search-input"
                            placeholder={t('enter_search')}
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
                            <div className="text-center py-5 w-100">{t('search_not_found')}</div>
                        )}
                    </div>
                </div>
            </Container>

            {/* Create Chat Room Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t('new_chat_room')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label htmlFor="chatTitle" className="form-label">{t('chating_room_title')}</label>
                        <input
                            type="text"
                            id="chatTitle"
                            className="form-control"
                            placeholder={t('input_chat_title')}
                            value={newChatTitle}
                            onChange={(e) => setNewChatTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateChatRoom()}
                            disabled={creating}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={creating}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleCreateChatRoom} disabled={creating}>
                        {creating ? t('creating') : t('create')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CommunityChatList;
