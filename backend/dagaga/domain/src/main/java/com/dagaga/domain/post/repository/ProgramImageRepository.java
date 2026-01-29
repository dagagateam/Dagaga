package com.dagaga.domain.post.repository;

import com.dagaga.domain.post.entity.ProgramImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgramImageRepository extends JpaRepository<ProgramImage, Integer> {
    List<ProgramImage> findAllByArticleSeqOrderByImageOrderAsc(Integer articleSeq);

    List<ProgramImage> findAllByArticleSeqIn(List<Integer> articleSeqs);
}
