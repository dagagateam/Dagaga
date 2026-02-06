package com.dagaga.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.dagaga.chat.dto.MessageControllerDto.SendMessageResponse;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RedisChatPayload {
    private String destination;
    private SendMessageResponse content;
}
