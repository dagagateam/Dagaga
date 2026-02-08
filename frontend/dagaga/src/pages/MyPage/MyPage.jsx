import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Card } from 'react-bootstrap';
import SavedNewsCard from '../../components/MyPage/SavedNewsCard';
import MyInfo from '../../components/MyPage/MyInfo';
import JoinedChatItem from '../../components/community/chat/JoinedChatItem';
import { fetchJoinedChats } from '../../api/communityApi';
import { useUserStore } from '../../store/userStore';
import stockProfile from '../../assets/icons/stock_profile.jpg';
import './MyPage.css';

const MyPage = () => {
  const { t } = useTranslation();
  const { user, savedItems, likedPostIds, joinedChats, setJoinedChats, toggleSave, toggleLike, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser(); // Fetch latest user data when MyPage mounts

    if (joinedChats.length === 0) {
      const loadChats = async () => {
        try {
          const response = await fetchJoinedChats();
          const joinedData = Array.isArray(response) ? response : response.data;

          if (joinedData && Array.isArray(joinedData)) {
            const mappedJoinedChats = joinedData.map(chat => ({
              id: chat.roomId,
              title: chat.title,
              participantCount: chat.participantCount
            }));
            setJoinedChats(mappedJoinedChats);
          }
        } catch (error) {
          console.error("Failed to fetch chat rooms:", error);
        }
      };
      loadChats();
    }
  }, [joinedChats.length, setJoinedChats, fetchUser]);

  const userNickname = user?.nickname || "Guest";

  return (
    <Container fluid className="my-page-container">
      {/* Greeting Header */}
      <Card className="greeting-card mb-3">
        <Card.Body className="greeting-body">
          <div key="profile" className="profile-circle">
            <img
              src={user?.profileImage || stockProfile}
              alt="Profile"
              className="profile-img"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
          <h2 key="greeting" className="greeting-text">
            <strong>{t('hello_user', { name: userNickname })}</strong>
          </h2>
        </Card.Body>
      </Card>



      {/* Bottom Grid */}
      <div>
        <Row className="bottom-sections g-4">
          <Col lg={4} md={12} className="d-flex flex-column">
            <div className="section-title-wrapper mb-3">
              <span className="section-badge">{t('my_chat_rooms')}</span>
            </div>
            <Card className="joined-chat-card">
              <Card.Body className="joined-chat-body">
                {joinedChats.length > 0 ? (
                  <>
                    {joinedChats.map(chat => (
                      <JoinedChatItem key={chat.id} chat={chat} />
                    ))}
                  </>
                ) : (
                  <div className="p-3 text-muted text-center">
                    {t('no_joined_chats')}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={8} md={12} className="d-flex flex-column">
            <div className="section-title-wrapper mb-3">
              <span className="section-badge">{t('my_info_title')}</span>
            </div>
            <MyInfo />
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default MyPage;
