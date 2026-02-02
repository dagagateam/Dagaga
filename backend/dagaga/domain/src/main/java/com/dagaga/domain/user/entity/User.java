package com.dagaga.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password") // Nullable for OAuth users
    private String password;

    @Column(name = "nickname", unique = true)
    private String nickname;

    @Column(name = "view_lang_code", nullable = false)
    private String viewLangCode;

    @Column(name = "native_lang_code", nullable = false)
    private String nativeLangCode;

    @Column(name = "location_id")
    private Integer locationId;

    @Column(name = "arrival_date")
    private LocalDate arrivalDate;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "social_provider")
    private String socialProvider;

    @Column(name = "social_id") // External OAuth provider ID
    private String socialId;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.modifiedAt = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.profileImage == null) {
            this.profileImage = "default_avatar.png";
        }
        if (this.role == null) {
            this.role = "ROLE_USER";
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    @Builder
    public User(String email, String password, String nickname, String viewLangCode, 
                String nativeLangCode, Integer locationId, LocalDate arrivalDate, 
                String profileImage, String socialProvider, String socialId, 
                String role, Boolean isActive) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.viewLangCode = viewLangCode;
        this.nativeLangCode = nativeLangCode;
        this.locationId = locationId;
        this.arrivalDate = arrivalDate;
        this.profileImage = profileImage;
        this.socialProvider = socialProvider;
        this.socialId = socialId;
        this.role = role;
        this.isActive = isActive;
    }

    public void updateLocationId(Integer locationId) {
        this.locationId = locationId;
        this.modifiedAt = LocalDateTime.now();
    }
}
