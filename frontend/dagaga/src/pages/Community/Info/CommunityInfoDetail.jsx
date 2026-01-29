import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { fetchCommunityInfo, fetchCommunityInfoDetail } from '../../../api/communityApi'; // Make sure to add fetchDetail if available, or fetch list and find
import './CommunityInfoDetail.css';

import heartIcon from '../../../assets/icons/heart.png';
import unheartIcon from '../../../assets/icons/unheart.png';
import bookmarkedIcon from '../../../assets/icons/bookmark.png';
import unbookmarkIcon from '../../../assets/icons/unbookmark.png';


const CommunityInfoDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');

    const [comments, setComments] = useState([]);

    useEffect(() => {
        const loadDetail = async () => {
            try {
                // Fetch detail using the new API function
                const response = await fetchCommunityInfoDetail(id);
                const data = response.data;

                if (data) {
                    setInfo({
                        id: data.postId,
                        title: data.title,
                        orgName: data.organization,
                        content: data.content,
                        image: data.image || `https://via.placeholder.com/600x800/F8B15E/FFFFFF?text=${encodeURIComponent(data.organization)}`,
                        startDate: data.startDate,
                        endDate: data.endDate,
                        isLiked: data.isLiked,
                        isBookmarked: data.isBookmarked
                    });
                    if (data.comments) {
                        setComments(data.comments);
                    }
                }
            } catch (error) {
                console.error("Failed to load detail:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDetail();
    }, [id]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        const newComment = {
            id: Date.now(),
            user: "나", // Current user
            text: comment,
            avatar: "https://i.pravatar.cc/150?u=me"
        };
        setComments([...comments, newComment]);
        setComment('');
    };

    if (loading) return <div>Loading...</div>;
    if (!info) return <div>Data not found</div>;

    return (
        <div className="community-detail-container">
            <Container>
                <div className="detail-card">
                    {/* Left Side: Image */}
                    <div className="detail-left">
                        <img src={info.image} alt={info.title} className="detail-poster" />
                    </div>

                    {/* Right Side: Content */}
                    <div className="detail-right">
                        <div className="detail-header">
                            <div className="detail-org">
                                <span className="detail-org-logo">Dagaga</span>
                                <span className="detail-org-name">{info.orgName}</span>
                            </div>
                            <div className="detail-actions">
                                <button className="detail-icon-btn">
                                    <img src={info.isLiked ? heartIcon : unheartIcon} alt="Like" />
                                </button>
                                <button className="detail-icon-btn">
                                    <img src={info.isBookmarked ? bookmarkedIcon : unbookmarkIcon} alt="Bookmark" />
                                </button>
                            </div>
                        </div>

                        <h1 className="detail-title">{info.title}</h1>

                        <div className="detail-periods">
                            <div className="detail-period-row">
                                <span className="period-label">접수 기간</span>
                                <span className="period-value">| {info.startDate} ~ {info.endDate}</span>
                            </div>
                            <div className="detail-period-row">
                                <span className="period-label">진행 기간</span>
                                <span className="period-value">| {info.startDate} ~ {info.endDate}</span>
                            </div>
                        </div>

                        <div className="detail-description">
                            {info.content}
                        </div>

                        <div className="detail-comments-section">
                            <div className="comment-list">
                                {comments.map(cmt => (
                                    <div key={cmt.id} className="comment-item">
                                        <img src={cmt.avatar} alt={cmt.user} className="comment-avatar" />
                                        <div className="comment-text-wrapper">
                                            <span className="comment-author">{cmt.user}</span>
                                            <span className="comment-body">{cmt.text}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form className="comment-input-area" onSubmit={handleCommentSubmit}>
                                <input
                                    type="text"
                                    className="comment-input"
                                    placeholder="참여를 원하시면 댓글 남겨주세요"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <button type="submit" className="comment-send-btn">
                                    {/* Using a simple text arrow or SVG if image is not ready, 
                                        but trying to use an icon if available or CSS shape */}
                                    ➤
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CommunityInfoDetail;
