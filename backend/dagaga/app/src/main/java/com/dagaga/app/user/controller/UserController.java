package com.dagaga.app.user.controller;

import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/check-email")
    public ResponseEntity<Void> checkEmail(@RequestParam("email") String email) {
        userService.validateEmailFormat(email);
        userService.checkEmailDuplicate(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<Long> register(@RequestBody UserRegisterDto dto) {
        Long userId = userService.register(dto);
        return ResponseEntity.ok(userId);
    }
}
