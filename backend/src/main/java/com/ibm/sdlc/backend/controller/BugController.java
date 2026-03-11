package com.ibm.sdlc.backend.controller;

import com.ibm.sdlc.backend.dto.BugRequest;
import com.ibm.sdlc.backend.dto.CommentRequest;
import com.ibm.sdlc.backend.entity.Bug;
import com.ibm.sdlc.backend.entity.Comment;
import com.ibm.sdlc.backend.entity.Status;
import com.ibm.sdlc.backend.service.BugService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bugs")
public class BugController {

    private final BugService bugService;

    public BugController(BugService bugService) {
        this.bugService = bugService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TESTER')")
    public ResponseEntity<Bug> createBug(@RequestBody BugRequest request, Authentication authentication) {
        return ResponseEntity.ok(bugService.createBug(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Bug>> getBugs(Authentication authentication) {
        return ResponseEntity.ok(bugService.getBugsForUser(authentication.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Bug> updateStatus(@PathVariable Long id, @RequestParam Status status,
            Authentication authentication) {
        return ResponseEntity.ok(bugService.updateStatus(id, status, authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bug> getBugById(@PathVariable Long id) {
        return ResponseEntity.ok(bugService.getBugById(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable Long id, @RequestBody CommentRequest request, Authentication authentication) {
        return ResponseEntity.ok(bugService.addComment(id, request.getText(), authentication.getName()));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(bugService.getComments(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBug(@PathVariable Long id) {
        bugService.deleteBug(id);
        return ResponseEntity.noContent().build();
    }
}
