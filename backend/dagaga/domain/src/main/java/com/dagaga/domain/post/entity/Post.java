package com.dagaga.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Integer postId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "location_id", nullable = false)
    private Integer locationId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "content_image")
    private String contentImage;

    @Column(name = "article_seq")
    private Integer articleSeq;

    @Column(name = "view_count")
    private Integer viewCount;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.viewCount == null) {
            this.viewCount = 0;
        }
    }

    @Builder
    public Post(Integer userId, String category, Integer locationId, String title, String content, String contentImage,
            Integer articleSeq) {
        this.userId = userId;
        this.category = category;
        this.locationId = locationId;
        this.title = title;
        this.content = content;
        this.contentImage = contentImage;
        this.articleSeq = articleSeq;
    }
}
