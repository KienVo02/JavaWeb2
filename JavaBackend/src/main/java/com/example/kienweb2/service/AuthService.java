package com.example.kienweb2.service;

import com.example.kienweb2.dto.AuthResponse;
import com.example.kienweb2.dto.LoginRequest;
import com.example.kienweb2.dto.UserResponse;
import com.example.kienweb2.entity.User;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    UserResponse me(String authorizationHeader);

    void logout(String authorizationHeader);

    User requireUserByToken(String token);
}
