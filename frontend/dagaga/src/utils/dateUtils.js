/**
 * 시작일과 종료일을 기간 문자열로 포맷팅합니다.
 * @param {string} start - 시작일 문자열
 * @param {string} end - 종료일 문자열
 * @returns {string} 포맷팅된 기간 문자열 (예: "시작일 ~ 종료일") 또는 둘 다 없을 경우 "미정"
 */
export const formatPeriod = (start, end) => {
    if (!start && !end) return "미정";
    return `${start || ''} ~ ${end || ''}`;
};
