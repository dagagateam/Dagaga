package com.dagaga.domain.user.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class UserRegisteredEvent {
    private final Integer userId;
    private final Integer locationId;
}
