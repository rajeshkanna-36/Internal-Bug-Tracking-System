package com.ibm.sdlc.backend.dto;

import com.ibm.sdlc.backend.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String name;
    private Role role;
}
