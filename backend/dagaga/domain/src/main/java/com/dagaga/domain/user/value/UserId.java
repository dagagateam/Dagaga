package com.dagaga.domain.user.value;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자의 고유 식별자를 나타내는 값 객체
 */
@Getter
@EqualsAndHashCode
@AllArgsConstructor(staticName = "of")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserId {
    private Integer value;

    @Override
    public String toString() {
        return String.valueOf(value);
    }
}
