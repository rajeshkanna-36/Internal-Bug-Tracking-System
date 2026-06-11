package com.ibm.sdlc.backend.controller;

import com.ibm.sdlc.backend.entity.User;
import com.ibm.sdlc.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(java.security.Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @org.springframework.web.bind.annotation.PutMapping("/profile")
    public ResponseEntity<User> updateProfile(java.security.Principal principal, @org.springframework.web.bind.annotation.RequestBody com.ibm.sdlc.backend.dto.UserProfileRequest request) {
        return userRepository.findByUsername(principal.getName())
                .map(user -> {
                    if (request.getName() != null) user.setName(request.getName());
                    user.setAvatarUrl(request.getAvatarUrl());
                    user.setDepartment(request.getDepartment());
                    user.setJobTitle(request.getJobTitle());
                    user.setBio(request.getBio());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
