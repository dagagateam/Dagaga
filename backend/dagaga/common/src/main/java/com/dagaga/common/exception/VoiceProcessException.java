package com.dagaga.common.exception;

public class VoiceProcessException extends RuntimeException {
    public VoiceProcessException(String message) {
        super(message);
    }

    public VoiceProcessException(String message, Throwable cause) {
        super(message, cause);
    }
}
