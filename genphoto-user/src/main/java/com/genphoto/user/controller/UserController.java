package com.genphoto.user.controller;

import com.genphoto.common.dto.Result;
import com.genphoto.user.dto.*;
import com.genphoto.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request);
        return Result.success();
    }

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return Result.success(response);
    }

    @GetMapping("/profile")
    public Result<UserProfileResponse> getProfile(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(userService.getProfile(userId));
    }

    @PutMapping("/profile")
    public Result<Void> updateProfile(Authentication authentication,
                                      @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        userService.updateProfile(userId, request);
        return Result.success();
    }

    @PutMapping("/password")
    public Result<Void> changePassword(Authentication authentication,
                                       @RequestBody Map<String, String> request) {
        Long userId = (Long) authentication.getPrincipal();
        userService.changePassword(userId, request.get("oldPassword"), request.get("newPassword"));
        return Result.success();
    }
}
