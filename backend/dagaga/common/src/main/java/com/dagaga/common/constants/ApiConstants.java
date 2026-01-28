package com.dagaga.common.constants;

/**
 * API 응답 코드 상수
 */
public class ApiConstants {
    
    // HTTP Status Codes
    public static final String SUCCESS_CODE = "200";
    public static final String BAD_REQUEST_CODE = "400";
    public static final String PAYLOAD_TOO_LARGE_CODE = "413";
    public static final String INTERNAL_SERVER_ERROR_CODE = "500";
    
    private ApiConstants() {
        // Utility class - prevent instantiation
    }
}
