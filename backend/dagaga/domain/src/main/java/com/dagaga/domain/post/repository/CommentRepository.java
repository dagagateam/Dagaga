package com.dagaga.domain.post.repository;

import com.dagaga.domain.post.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findAllByPostIdOrderByCreatedAtAsc(Integer postId);

    List<Comment> findAllByParentCommentIdOrderByCreatedAtAsc(Integer parentCommentId);
}
