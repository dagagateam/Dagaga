package com.dagaga.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "comment_translations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommentTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "translation_id")
    private Long translationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @Column(name = "target_lang", nullable = false)
    private String targetLang;

    @Column(name = "translated_content", nullable = false, columnDefinition = "TEXT")
    private String translatedContent;

    @Column(name = "translated_at")
    private LocalDateTime translatedAt;

    @Builder
    public CommentTranslation(Comment comment, String targetLang, String translatedContent) {
        this.comment = comment;
        this.targetLang = targetLang;
        this.translatedContent = translatedContent;
        this.translatedAt = LocalDateTime.now();
    }
}
