package com.dagaga.domain.chat.language.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "languages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Language {

    @Id
    @Column(name = "lang_code", length = 10)
    private String langCode;

    @Column(name = "lang_name", nullable = false, length = 50)
    private String langName;

    @Column(name = "english_name", length = 50)
    private String englishName;

    @Column(name = "is_active")
    @ColumnDefault("true")
    private Boolean isActive;

    @Builder
    public Language(String langCode, String langName, String englishName, Boolean isActive) {
        this.langCode = langCode;
        this.langName = langName;
        this.englishName = englishName;
        this.isActive = isActive != null ? isActive : true;
    }
}
