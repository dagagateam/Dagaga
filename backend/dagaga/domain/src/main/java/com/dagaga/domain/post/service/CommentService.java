package com.dagaga.domain.post.service;

import com.dagaga.domain.post.dto.CommentCreateRequest;
import com.dagaga.domain.post.dto.CommentResponse;
import com.dagaga.domain.post.entity.Comment;
import com.dagaga.domain.post.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;

import com.dagaga.domain.chat.language.repository.LanguageRepository;
import com.dagaga.domain.common.translate.port.TranslationPort;
import com.dagaga.domain.common.translate.port.TranslationResult;
import com.dagaga.domain.post.entity.CommentTranslation;
import com.dagaga.domain.post.repository.CommentTranslationRepository;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionSynchronization;
import lombok.extern.slf4j.Slf4j;
import java.util.concurrent.Executor;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentTranslationRepository commentTranslationRepository;
    private final com.dagaga.domain.user.repository.UserRepository userRepository;
    private final LanguageRepository languageRepository;
    private final TranslationPort translationPort;
    @Qualifier("translationExecutor")
    private final Executor translationExecutor;
    private final TransactionTemplate transactionTemplate;

    public void createComment(Integer postId, Integer userId, CommentCreateRequest request) {
        // Comment 저장
        // 저장 -> 번역 -> 업데이트
        
        Comment comment = transactionTemplate.execute(status -> {
            Comment newComment = Comment.builder()
                    .postId(postId)
                    .userId(userId)
                    .parentCommentId(request.getParentCommentId())
                    .content(request.getContent())
                    .build();
            return commentRepository.save(newComment);
        });

        if (comment == null) {
            throw new RuntimeException("댓글 저장 실패");
        }

        // 번역 (비동기 처리 - 트랜잭션 커밋 후 실행 보장)
        Runnable translationTask = () -> {
            try {
                List<String> targetLangs = languageRepository.findAllActiveLangCodes();
                log.info("댓글 번역 대상 언어 목록: {}", targetLangs);

                if (!targetLangs.isEmpty()) {
                    TranslationResult result = translationPort.detectAndTranslate(request.getContent(), targetLangs);
                    log.info("번역 결과: 감지된 언어={}, 번역된 내용={}", result.getDetectedLanguage(), result.getTranslations());

                    // 번역 저장 & 원본 언어 업데이트
                    transactionTemplate.executeWithoutResult(status -> {
                        saveTranslationsAndOriginalLang(comment.getCommentId(), result);
                    });
                } else {
                    log.warn("번역할 활성 언어를 찾을 수 없습니다.");
                }
            } catch (Exception e) {
                log.error("댓글 번역 실패: ", e);
            }
        };

        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    // 트랜잭션이 성공적으로 커밋된 후에만 실행되도록
                    CompletableFuture.runAsync(translationTask, translationExecutor);
                }
            });
        } else {
            // 트랜잭션이 없으면 바로 실행
            CompletableFuture.runAsync(translationTask, translationExecutor);
        }
    }

    private void saveTranslationsAndOriginalLang(Integer commentId, TranslationResult result) {
        Comment comment = commentRepository.findById(commentId).orElseThrow();
        
        // 원본 언어 업데이트
        String detectedLang = result.getDetectedLanguage();
        if (detectedLang != null && !detectedLang.equals("unknown")) {
             comment.updateOriginalLang(detectedLang); 
        }

        result.getTranslations().forEach((lang, translatedText) -> {
            CommentTranslation translation = CommentTranslation.builder()
                    .comment(comment)
                    .targetLang(lang)
                    .translatedContent(translatedText)
                    .build();
            commentTranslationRepository.save(translation);
        });
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Integer postId, Integer currentUserId, String viewLangCode) {
        List<Comment> allComments = commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId);

        if (allComments.isEmpty()) {
            return Collections.emptyList();
        }

        // 사용자 닉네임 일괄 조회
        Set<Integer> userIds = allComments.stream()
                .map(Comment::getUserId)
                .collect(Collectors.toSet());

        Map<Integer, String> nicknameMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(
                        com.dagaga.domain.user.entity.User::getUserId,
                        com.dagaga.domain.user.entity.User::getNickname,
                        (existing, replacement) -> existing));

        Map<Integer, List<Comment>> repliesMap = allComments.stream()
                .filter(c -> c.getParentCommentId() != null)
                .collect(Collectors.groupingBy(Comment::getParentCommentId));

        return allComments.stream()
                .filter(c -> c.getParentCommentId() == null)
                .map(c -> convertToResponse(c, repliesMap, nicknameMap, currentUserId, viewLangCode))
                .collect(Collectors.toList());
    }

    private CommentResponse convertToResponse(Comment comment, Map<Integer, List<Comment>> repliesMap,
                                              Map<Integer, String> nicknameMap, Integer currentUserId, String viewLangCode) {
        List<CommentResponse> replies = repliesMap.getOrDefault(comment.getCommentId(), List.of()).stream()
                .map(r -> convertToResponse(r, repliesMap, nicknameMap, currentUserId, viewLangCode))
                .collect(Collectors.toList());

        String content = comment.getContent();
        
        // 내가 쓴 댓글이 아니어야 함
        // viewLangCode가 있고
        // 해당 언어로 된 번역이 존재해야 함
        if (currentUserId != null && !currentUserId.equals(comment.getUserId())) {
             String translatedText = comment.getTranslations().stream()
                     .filter(t -> t.getTargetLang().equalsIgnoreCase(viewLangCode))
                     .map(CommentTranslation::getTranslatedContent)
                     .findFirst()
                     .orElse(null);
             
             if (translatedText != null) {
                 content = translatedText;
             }
        }

        return CommentResponse.builder()
                .commentId(comment.getCommentId())
                .userId(comment.getUserId())
                .nickname(nicknameMap.getOrDefault(comment.getUserId(), "Unknown"))
                .content(content)
                .createdAt(comment.getCreatedAt())
                .replies(replies)
                .build();
    }
}
