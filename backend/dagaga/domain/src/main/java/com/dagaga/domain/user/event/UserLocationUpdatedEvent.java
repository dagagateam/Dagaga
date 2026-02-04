package com.dagaga.domain.user.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class UserLocationUpdatedEvent {
    private final Integer userId;
    private final Integer oldLocationId;
    private final Integer newLocationId;
}
