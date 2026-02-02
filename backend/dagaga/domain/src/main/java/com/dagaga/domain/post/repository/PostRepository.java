package com.dagaga.domain.post.repository;

import com.dagaga.domain.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Integer> {
    Optional<Post> findByArticleSeq(Integer articleSeq);

    Page<Post> findByCategory(String category, Pageable pageable);

    Page<Post> findByCategoryAndLocationId(String category, Integer locationId, Pageable pageable);
}
