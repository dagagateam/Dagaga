package com.dagaga.controller;

import com.dagaga.domain.user.dto.UserLoginDto;
import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;

    @PostMapping("/check-email")
    public ResponseEntity<Void> checkEmail(@RequestParam("email") @Email String email) {
        userService.checkEmailDuplicate(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/signup")
    public ResponseEntity<Integer> register(@RequestBody @Valid UserRegisterDto dto) {
        Integer userId = userService.register(dto);
        return ResponseEntity.ok(userId);
    }

    @PostMapping("/login")
    public ResponseEntity<Integer> login(@RequestBody @Valid UserLoginDto dto) {
        Integer userId = userService.login(dto);
        return ResponseEntity.ok(userId);
    }
}
