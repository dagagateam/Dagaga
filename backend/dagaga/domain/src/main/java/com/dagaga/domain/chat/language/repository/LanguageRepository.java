package com.dagaga.domain.chat.language.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.dagaga.domain.chat.language.entity.Language;

import java.util.List;

@Repository
public interface LanguageRepository extends JpaRepository<Language, String> {

    // 지원하고 있는 언어 코드 목록 조회
    @Query("SELECT l.langCode FROM Language l WHERE l.isActive = true")
    List<String> findAllActiveLangCodes();
}
