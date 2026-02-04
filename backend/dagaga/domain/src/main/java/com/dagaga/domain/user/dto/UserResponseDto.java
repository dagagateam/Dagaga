package com.dagaga.domain.user.dto;

import com.dagaga.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponseDto {
    private Integer userId;
    private String email;
    private String nickname;
    private String viewLangCode;
    private String nativeLangCode;
    private Integer locationId;
    private LocalDate arrivalDate;
    private String profileImage;
    private String socialProvider;
    private LocalDateTime modifiedAt;
    private LocalDateTime createdAt;

    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .viewLangCode(user.getViewLangCode())
                .nativeLangCode(user.getNativeLangCode())
                .locationId(user.getLocationId())
                .arrivalDate(user.getArrivalDate())
                .profileImage(user.getProfileImage())
                .socialProvider(user.getSocialProvider())
                .modifiedAt(user.getModifiedAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
