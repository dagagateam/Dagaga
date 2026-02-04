import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CommunityInfo.css';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { fetchCommunityInfo } from '../../../api/communityApi';
import { getLocationName } from '../../../data/regionData';


import bookmarkedIcon from '../../../assets/icons/bookmark.png';
import unbookmarkIcon from '../../../assets/icons/unbookmark.png';

import { useUserStore } from '../../../store/userStore';
import LocationBadge from '../../../components/common/LocationBadge';

const CommunityInfo = () => {
    const navigate = useNavigate();
    const { user, savedItems, likedPostIds, toggleSave, toggleLike } = useUserStore();
    const [infos, setInfos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRegion, setUserRegion] = useState('');
    const [searchTerm, setSearchTerm] = useState('');



    const checkIsExpired = (periodString) => {
        if (!periodString || periodString === "미정") return false;
        const parts = periodString.split('~');
        if (parts.length < 2) return false;
        const endDateStr = parts[1].trim();
        const endDate = new Date(endDateStr);
        const today = new Date();

        endDate.setHours(23, 59, 59, 999);
        return today.getTime() > endDate.getTime();
    };

    useEffect(() => {
        const regionName = user?.locationId ? getLocationName(user.locationId) : '지역 설정 필요';
        setUserRegion(regionName);

        const loadData = async () => {
            try {
                const response = await fetchCommunityInfo(0, 100); // 더 많은 데이터 요청

                // 백엔드 응답 구조: { success, message, data: { content: [...], totalElements, ... } }
                const allPosts = response.data.content || [];

                // DEBUG: Posts loaded info
                // console.log(`Loaded ${allPosts.length} posts for region: ${regionName}`);

                // 백엔드 응답 형식 → 프론트엔드 형식 변환
                const items = allPosts.map(post => {
                    // 날짜 포맷팅 함수
                    const formatDate = (start, end) => {
                        if (!start && !end) return "미정";
                        return `${start || ''} ~ ${end || ''}`;
                    };

                    const applicationPeriod = formatDate(post.regStartDate, post.regEndDate);
                    const progressPeriod = formatDate(post.progStartDate, post.progEndDate);

                    return {
                        id: post.postId,
                        title: post.title || "제목 없음",
                        orgName: "다가가정보지원", // 고정값
                        content: post.content || "",
                        applicationPeriod: applicationPeriod,
                        progressPeriod: progressPeriod,
                        // 마감 여부는 접수 마감일(regEndDate) 기준으로 판단 (없으면 진행 마감일 기준)
                        isExpired: checkIsExpired(formatDate(post.regStartDate, post.regEndDate)) || checkIsExpired(formatDate(post.progStartDate, post.progEndDate)),
                        image: post.imageUrls?.[0] || `https://via.placeholder.com/600x300/F8B15E/FFFFFF?text=${encodeURIComponent(post.title || 'No Image')}`
                    };
                });

                setInfos(items);
            } catch (error) {
                console.error("Failed to fetch community info:", error);
                // 에러 발생 시 빈 배열로 설정
                setInfos([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const filteredInfos = infos.filter(info =>
        info.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        info.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (info.content && info.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="text-center py-5">Loading...</div>;

    return (
        <div className="community-info-container">
            <Container>
                <div className="info-header">
                    <div className="header-left">
                        <h2>정보</h2>
                        <LocationBadge region={userRegion} />
                    </div>
                    <div className="search-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="검색어를 입력하세요 (제목, 기관, 내용)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="info-list">
                    {filteredInfos.length > 0 ? (
                        filteredInfos.map((info) => {
                            const isLiked = likedPostIds.includes(info.id);
                            const isBookmarked = savedItems.some(item => item.id === info.id);

                            return (
                                <Card key={info.id} className="info-card" onClick={() => navigate(`/Community/Info/${info.id}`)} style={{ cursor: 'pointer' }}>
                                    <div className="info-card-inner">
                                        <div className="info-img-wrapper">
                                            <img src={info.image} alt={info.title} />
                                            {info.isExpired && (
                                                <div className="expired-overlay">
                                                    <span>마감</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="info-content">
                                            <div className="info-meta-top">
                                                <div className="org-info">
                                                    <span className="org-logo">Dagaga</span>
                                                    <span className="org-name">{info.orgName}</span>
                                                </div>
                                                <div className="action-icons">
                                                    {/* Like Button Removed */}
                                                    <button className="icon-btn" onClick={(e) => { e.stopPropagation(); toggleSave(info); }}>
                                                        <img
                                                            src={isBookmarked ? bookmarkedIcon : unbookmarkIcon}
                                                            alt="Bookmark"
                                                            className="icon-img"
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            <h3 className="info-title">{info.title}</h3>

                                            <div className="info-periods">
                                                <div className="period-row">
                                                    <span className="period-label">접수 기간</span>
                                                    <span className="period-date">| {info.applicationPeriod}</span>
                                                </div>
                                                <div className="period-row">
                                                    <span className="period-label">진행 기간</span>
                                                    <span className="period-date">| {info.progressPeriod}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="no-results text-center py-5">
                            검색 결과가 없습니다.
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default CommunityInfo;
