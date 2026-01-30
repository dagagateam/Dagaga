import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import SavedNewsCard from '../../components/my-page/SavedNewsCard';
import MyInfo from '../../components/my-page/MyInfo';
import JoinedChatItem from '../../components/community/chat/JoinedChatItem';
import { fetchChatRooms } from '../../api/communityApi';
import { useUserStore } from '../../store/userStore';
import './MyPage.css';

const MyPage = () => {
  const { user, savedItems, likedPostIds, joinedChats, setJoinedChats, toggleSave, toggleLike } = useUserStore();
  
  useEffect(() => {
    // Fetch only if empty or background update needed. 
    // Here we fetch if empty to avoid layout shift, or could fetch in background to update staleness.
    // Given the user request "doesn't have to load for a while", checking length > 0 is good.
    if (joinedChats.length === 0) {
      const loadChats = async () => {
        try {
          const response = await fetchChatRooms();
          if (response?.data?.joinedChats) {
            setJoinedChats(response.data.joinedChats);
          }
        } catch (error) {
          console.error("Failed to fetch chat rooms:", error);
        }
      };
      loadChats();
    }
  }, [joinedChats.length, setJoinedChats]);
  
  const userNickname = user?.nickname || "Guest";

  return (
    <Container fluid className="my-page-container">
      {/* Greeting Header */}
      <Card className="greeting-card mb-3">
        <Card.Body className="greeting-body">
          <div className="profile-circle">
            <img 
              src={user?.profileImage || "/assets/profile-placeholder.jpg"} 
              alt="Profile" 
              className="profile-img" 
              onError={(e) => {e.target.style.display='none'}} 
            />
          </div>
          <h2 className="greeting-text">
            <strong>{userNickname}</strong>님, 안녕하세요
          </h2>
        </Card.Body>
      </Card>

      {/* Saved News Section */}
      <div className="section-container mb-3">
        <div className="section-title-wrapper mb-2">
          <span className="section-badge">저장한 정보글</span>
        </div>
        <div className="saved-news-list-container">
          <div className="saved-news-scroll">
            {savedItems.length > 0 ? (
              savedItems.map(news => (
                <SavedNewsCard 
                  key={news.id}
                  title={news.title}
                  orgName={news.orgName}
                  applicationPeriod={news.applicationPeriod}
                  progressPeriod={news.progressPeriod}
                  isExpired={news.isExpired}
                  isLiked={likedPostIds.includes(news.id)} // Accessing reactive state
                  isBookmarked={true} // Since it is in savedItems, it is bookmarked
                  onToggleLike={() => toggleLike(news.id)}
                  onToggleBookmark={() => toggleSave(news)}
                />
              ))
            ) : (
               <div className="p-3 text-muted">저장한 정보가 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <Row className="bottom-sections g-4">
        <Col lg={4} md={12}>
          <div className="section-title-wrapper mb-3">
            <span className="section-badge">내 채팅방</span>
          </div>
          <Card className="joined-chat-card">
            <Card.Body className="joined-chat-body">
              {joinedChats.length > 0 ? (
                joinedChats.map(chat => (
                  <JoinedChatItem key={chat.id} chat={chat} />
                ))
              ) : (
                <div className="p-3 text-muted text-center">
                  참여 중인 채팅방이 없습니다.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8} md={12}>
          <div className="section-title-wrapper mb-3">
            <span className="section-badge">내 정보</span>
          </div>
          <MyInfo />
        </Col>
      </Row>
    </Container>
  );
};

export default MyPage;
