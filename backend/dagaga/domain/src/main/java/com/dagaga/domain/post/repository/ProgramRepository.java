package com.dagaga.domain.post.repository;

import com.dagaga.domain.post.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgramRepository extends JpaRepository<Program, Integer> {
    List<Program> findAllByOrderByCreatedAtDesc();

    List<Program> findAllByArticleSeqIn(List<Integer> articleSeqs);
}
