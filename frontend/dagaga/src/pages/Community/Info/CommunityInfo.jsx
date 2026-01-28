import React, { useState, useEffect } from 'react';
import './CommunityInfo.css';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { fetchCommunityInfo } from '../../../api/communityApi';

import heartIcon from '../../../assets/icons/heart.png';
import unheartIcon from '../../../assets/icons/unheart.png';
import bookmarkedIcon from '../../../assets/icons/bookmark.png';
import unbookmarkIcon from '../../../assets/icons/unbookmark.png';

const CommunityInfo = () => {
    const [infos, setInfos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRegion, setUserRegion] = useState('');

    const parseDateFromContent = (content, keyword) => {
        // Regex to find dates like YYYY-MM-DD ~ YYYY-MM-DD after the keyword
        // keyword example: "접수기간", "프로그램기간"
        const regex = new RegExp(`${keyword}\\s*(\\d{4}-\\d{2}-\\d{2}\\s*~\\s*\\d{4}-\\d{2}-\\d{2})`);
        const match = content.match(regex);
        return match ? match[1] : "미정";
    };

    const toggleLike = (id) => {
        setInfos(infos.map(info => 
            info.id === id ? { ...info, isLiked: !info.isLiked } : info
        ));
    };

    const toggleBookmark = (id) => {
        setInfos(infos.map(info => 
            info.id === id ? { ...info, isBookmarked: !info.isBookmarked } : info
        ));
    };

    useEffect(() => {
        // Get user region from localStorage
        const region = localStorage.getItem('regionName');
        setUserRegion(region || '서울 종로구'); // Fallback to default if not found

        const loadData = async () => {
             // To verify the loading state or handle errors, we utilize try-catch block here.
            try {
                const response = await fetchCommunityInfo(0, 20);
                const items = response.data.items.map(item => ({
                    id: item.postId,
                    title: item.title,
                    orgName: item.organization,
                    // Parse content for dates
                    applicationPeriod: parseDateFromContent(item.content, "접수기간"),
                    progressPeriod: parseDateFromContent(item.content, "프로그램기간"),
                    // Use image from API or fallback
                    image: item.image || `https://via.placeholder.com/600x300/F8B15E/FFFFFF?text=${encodeURIComponent(item.organization)}`, 
                    isLiked: false,
                    isBookmarked: false
                }));
                setInfos(items);
            } catch (error) {
                console.error("Failed to fetch community info:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return <div className="text-center py-5">Loading...</div>;

    return (
        <div className="community-info-container">
            <Container>
                {/* Header Section */}
                <div className="info-header">
                    <h2>정보</h2>
                    <div className="location-badge">
                        <span className="pin-icon">📍</span> {userRegion}
                    </div>
                </div>

                {/* Info List */}
                <div className="info-list">
                    {infos.map((info) => (
                        <Card key={info.id} className="info-card">
                            <div className="info-card-inner">
                                {/* Left: Image */}
                                <div className="info-img-wrapper">
                                    <img src={info.image} alt={info.title} />
                                </div>

                                {/* Right: Content */}
                                <div className="info-content">
                                    <div className="info-meta-top">
                                        <div className="org-info">
                                            <span className="org-logo">Dagaga</span>
                                            <span className="org-name">{info.orgName}</span>
                                        </div>
                                        <div className="action-icons">
                                            <button className="icon-btn" onClick={() => toggleLike(info.id)}>
                                                <img 
                                                    src={info.isLiked ? heartIcon : unheartIcon} 
                                                    alt="Like" 
                                                    className="icon-img" 
                                                />
                                            </button>
                                            <button className="icon-btn" onClick={() => toggleBookmark(info.id)}>
                                                <img 
                                                    src={info.isBookmarked ? bookmarkedIcon : unbookmarkIcon} 
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
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default CommunityInfo;
