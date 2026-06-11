package com.ibm.sdlc.backend.controller;

import com.ibm.sdlc.backend.entity.Project;
import com.ibm.sdlc.backend.entity.User;
import com.ibm.sdlc.backend.repository.ProjectRepository;
import com.ibm.sdlc.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectController(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        project.setOwner(user);
        project.setKey(project.getKey().toUpperCase());
        return ResponseEntity.ok(projectRepository.save(project));
    }
}
