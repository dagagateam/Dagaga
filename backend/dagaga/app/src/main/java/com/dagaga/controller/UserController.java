package com.dagaga.controller;

import com.dagaga.domain.user.dto.UserLoginDto;
import com.dagaga.domain.user.dto.UserRegisterDto;
import com.dagaga.domain.user.service.UserService;
import com.dagaga.chat.service.ChatRoomService;
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
    private final ChatRoomService chatRoomService;

    @PostMapping("/check-email")
    public ResponseEntity<Void> checkEmail(@RequestParam("email") @Email String email) {
        userService.checkEmailDuplicate(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/signup")
    public ResponseEntity<Integer> register(@RequestBody @Valid UserRegisterDto dto) {
        Integer userId = userService.register(dto);

        // 회원가입 후 해당 지역의 기본 채팅방 자동 참여
        chatRoomService.joinDefaultRoom(userId, dto.getLocationId());

        return ResponseEntity.ok(userId);
    }

    @PostMapping("/login")
    public ResponseEntity<Integer> login(@RequestBody @Valid UserLoginDto dto) {
        Integer userId = userService.login(dto);
        return ResponseEntity.ok(userId);
    }
}
