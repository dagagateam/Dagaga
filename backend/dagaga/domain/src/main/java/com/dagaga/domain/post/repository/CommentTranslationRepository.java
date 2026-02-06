package com.dagaga.domain.post.repository;

import com.dagaga.domain.post.entity.CommentTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentTranslationRepository extends JpaRepository<CommentTranslation, Long> {
}
