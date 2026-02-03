package com.dagaga.domain.user.value;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원의 고유 식별자를 나타내는 값 객체
 * (현재 프로젝트에서 User와 Member가 동일하게 취급되지만, 추후 확장을 고려하여 분리)
 */
@Getter
@EqualsAndHashCode
@AllArgsConstructor(staticName = "of")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MemberId {
    private Integer value;

    @Override
    public String toString() {
        return String.valueOf(value);
    }
}
