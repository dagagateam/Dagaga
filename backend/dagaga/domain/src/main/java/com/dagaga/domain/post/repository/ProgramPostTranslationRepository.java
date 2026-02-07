package com.dagaga.domain.post.repository;

import com.dagaga.domain.post.entity.ProgramPostTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 프로그램 게시글 번역 데이터를 관리하는 Repository
 */
@Repository
public interface ProgramPostTranslationRepository extends JpaRepository<ProgramPostTranslation, Long> {
    
    /**
     * 특정 게시글의 특정 언어 번역 조회
     */
    Optional<ProgramPostTranslation> findByPost_PostIdAndLanguageCode(Integer postId, String languageCode);
    
    /**
     * 특정 게시글의 번역 개수를 조회합니다.
     */
    long countByPost_PostId(Integer postId);
    
    /**
     * 특정 게시글의 모든 번역 조회
     */
    List<ProgramPostTranslation> findByPost_PostId(Integer postId);
    
    /**
     * 여러 게시글의 특정 언어 번역을 일괄 조회
     */
    List<ProgramPostTranslation> findByPost_PostIdInAndLanguageCode(List<Integer> postIds, String languageCode);
}
