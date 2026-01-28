package com.dagaga.domain.learning.repository;

import com.dagaga.domain.learning.entity.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionBankRepository extends JpaRepository<QuestionBank, Integer> {

    /**
     * 특정 카테고리의 질문들을 순서대로 조회
     * @param category 카테고리명
     * @return 질문 목록
     */
    List<QuestionBank> findByCategoryOrderByOrderIndex(String category);
}
