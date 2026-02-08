import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { fetchCommunityInfo, fetchCommunityInfoDetail, createComment, fetchComments } from '../../../api/communityApi';
import { useUserStore } from '../../../store/userStore';
import './CommunityInfoDetail.css';


import stockProfile from '../../../assets/icons/stock_profile.jpg';
import { formatPeriod } from '../../../utils/dateUtils';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';
import LoadingSpinner from '../../../components/common/LoadingSpinner';


const CommunityInfoDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useUserStore();
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');

    const [comments, setComments] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null); // { id, user }

    const loadComments = async () => {
        try {
            const commentsResponse = await fetchComments(id);
            const commentsData = commentsResponse.data || [];

            const mappedComments = commentsData.map(c => ({
                id: c.commentId,
                user: c.nickname || `User ${c.userId}`,
                text: c.content,
                avatar: (!c.profileImage || c.profileImage.includes('default_avatar'))
                    ? stockProfile
                    : c.profileImage,
                createdAt: c.createdAt,
                children: c.replies ? c.replies.map(child => ({
                    id: child.commentId,
                    user: child.nickname || `User ${child.userId}`,
                    text: child.content,
                    avatar: (!child.profileImage || child.profileImage.includes('default_avatar'))
                        ? stockProfile
                        : child.profileImage,
                    createdAt: child.createdAt,
                    children: []
                })) : []
            }));
            setComments(mappedComments);
        } catch (err) {
            console.error("Failed to load comments:", err);
            setComments([]);
        }
    };

    useEffect(() => {
        const loadDetail = async () => {
            try {
                // Fetch detail using the API function
                const response = await fetchCommunityInfoDetail(id);
                const data = response.data;

                if (data) {
                    // 날짜 포맷팅 함수
                    const formatDate = (start, end) => {
                        if (!start && !end) return "미정";
                        return `${start || ''} ~ ${end || ''}`;
                    };

                    setInfo({
                        id: data.postId,
                        title: data.title || t('no_title'),
                        orgName: t('dagaga_support'), // 고정값
                        content: data.content,
                        image: data.imageUrls?.[0] || 'https://placehold.co/600x800?text=No+Image',
                        contact: data.contact || "",
                        capacity: data.capacity || "",
                        applicationPeriod: formatPeriod(data.regStartDate, data.regEndDate),
                        progressPeriod: formatPeriod(data.progStartDate, data.progEndDate),
                        isLiked: false, // TODO: 좋아요 기능 구현 시 수정
                        isBookmarked: false // TODO: 북마크 기능 구현 시 수정
                    });

                    // 댓글 목록 가져오기
                    await loadComments();
                }
            } catch (error) {
                console.error("Failed to load detail:", error);
                setInfo(null);
            } finally {
                setLoading(false);
            }
        };

        loadDetail();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;



        if (!isLoggedIn || !user) {
            alert(t('login_required_service'));
            navigate('/login');
            return;
        }

        try {
            // Reply인 경우 parentCommentId 전달
            const parentId = replyingTo ? replyingTo.id : null;
            await createComment(Number(id), comment, user.userId, parentId);

            // Re-fetch comments from server to ensure data consistency
            await loadComments();

            setComment('');
            setReplyingTo(null); // 답글 모드 종료
        } catch (error) {
            console.error("댓글 작성 실패:", error);
            const errorMsg = error.response?.data?.message || 'comment_write_failed';
            alert(t(errorMsg));
        }
    };

    const handleReply = (commentItem) => {
        setReplyingTo({ id: commentItem.id, user: commentItem.user });
        // 스크롤 등 input으로 포커스 이동 로직이 필요할 수 있음
        const inputElement = document.querySelector('.comment-input');
        if (inputElement) inputElement.focus();
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setComment('');
    };

    // 재귀적으로 댓글 렌더링
    const renderComments = (list) => {
        return list.map(cmt => (
            <div key={cmt.id}>
                <div className="comment-item">
                    <img
                        src={cmt.avatar}
                        alt={cmt.user}
                        className="comment-avatar"
                        onError={(e) => { e.target.src = stockProfile }}
                    />
                    <div className="comment-text-wrapper">
                        <span className="comment-author">
                            {cmt.user}
                            {/* 답글 버튼 */}
                            <button className="comment-reply-btn" onClick={() => handleReply(cmt)}>{t('replying')}</button>
                        </span>
                        <span className="comment-body">{cmt.text}</span>
                    </div>
                </div>
                {/* 대댓글 렌더링 (재귀) */}
                {cmt.children && cmt.children.length > 0 && (
                    <div className="comment-children">
                        {renderComments(cmt.children)}
                    </div>
                )}
            </div>
        ));
    };

    if (loading) return <LoadingSpinner />;
    if (!info) return <div>Data not found</div>;

    return (
        <div className="community-detail-container">
            <Container>
                <div className="detail-header-nav">
                    <button className="detail-back-btn" onClick={() => navigate('/Community/Info')}>
                        <span>←</span> {t('back_info_list')}
                    </button>
                </div>
                <div className="detail-card">
                    {/* Left Side: Image */}
                    <div className="detail-left">
                        <ImageWithPlaceholder src={info.image} alt={info.title} className="detail-poster" />
                    </div>

                    {/* Right Side: Content */}
                    <div className="detail-right">
                        <div className="detail-header">
                            <div className="detail-org">
                                <span className="detail-org-logo">Dagaga</span>
                                <span className="detail-org-name">{info.orgName}</span>
                            </div>

                        </div>

                        <h1 className="detail-title">{info.title}</h1>

                        <div className="detail-periods">
                            <div className="detail-period-row">
                                <span className="period-label">{t('period_acceptance')}</span>
                                <span className="period-value">| {info.applicationPeriod}</span>
                            </div>
                            <div className="detail-period-row">
                                <span className="period-label">{t('period_progress')}</span>
                                <span className="period-value">| {info.progressPeriod}</span>
                            </div>
                        </div>

                        {info.content && (
                            <div className="detail-description">
                                {info.content}
                            </div>
                        )}

                        <div className="detail-comments-section">
                            <div className="comment-list">
                                {renderComments(comments)}
                            </div>

                            {/* 답글 작성 중 알림 표시 */}
                            {replyingTo && (
                                <div className="replying-indicator">
                                    <span>
                                        <Trans i18nKey="replying_to_user" values={{ user: replyingTo.user }} components={{ span: <span className="replying-to-text" /> }} />
                                    </span>
                                    <button className="cancel-reply-btn" onClick={handleCancelReply}>&times;</button>
                                </div>
                            )}

                            <form className="comment-input-area" onSubmit={handleCommentSubmit}>
                                <input
                                    type="text"
                                    className="comment-input"
                                    placeholder={replyingTo ? t('reply_input') : t('question_comment')}
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
