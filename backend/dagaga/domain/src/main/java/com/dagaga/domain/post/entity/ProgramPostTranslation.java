package com.dagaga.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 프로그램 게시글의 다국어 번역을 저장하는 엔티티
 * 베트남어(vi), 중국어(zh) 번역본을 관리
 */
@Entity
@Table(name = "program_post_translations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProgramPostTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "translation_id")
    private Long translationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "language_code", nullable = false, length = 10)
    private String languageCode;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public ProgramPostTranslation(Post post, String languageCode, String title, String content) {
        this.post = post;
        this.languageCode = languageCode;
        this.title = title;
        this.content = content;
    }
}
