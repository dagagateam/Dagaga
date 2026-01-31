package com.dagaga.chat.dto;

import com.dagaga.domain.chat.room.entity.RoomType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ChatRoomResponse {
    private Integer roomId;
    private String title;
    private RoomType roomType;
    private String creatorNickname;
    private long participantCount;
}
