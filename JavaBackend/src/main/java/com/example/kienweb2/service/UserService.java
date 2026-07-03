package com.example.kienweb2.service;

import com.example.kienweb2.dto.UserRequest;
import com.example.kienweb2.dto.UserResponse;
import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Long id, UserRequest request);

    void deleteUser(Long id);
}
