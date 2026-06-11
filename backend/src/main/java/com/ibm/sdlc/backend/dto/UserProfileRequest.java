package com.ibm.sdlc.backend.dto;

import lombok.Data;

@Data
public class UserProfileRequest {
    private String name;
    private String avatarUrl;
    private String department;
    private String jobTitle;
    private String bio;
}
