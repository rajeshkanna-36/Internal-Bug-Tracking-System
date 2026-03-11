package com.ibm.sdlc.backend.service;

import com.ibm.sdlc.backend.dto.BugRequest;
import com.ibm.sdlc.backend.entity.*;
import com.ibm.sdlc.backend.repository.BugRepository;
import com.ibm.sdlc.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BugService {

    private final BugRepository bugRepository;
    private final UserRepository userRepository;
    private final com.ibm.sdlc.backend.repository.CommentRepository commentRepository;

    public BugService(BugRepository bugRepository, UserRepository userRepository, com.ibm.sdlc.backend.repository.CommentRepository commentRepository) {
        this.bugRepository = bugRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
    }

    public Bug createBug(BugRequest request, String reporterUsername) {
        User reporter = userRepository.findByUsername(reporterUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Bug bug = new Bug();
        bug.setTitle(request.getTitle());
        bug.setDescription(request.getDescription());
        bug.setStepsToReproduce(request.getStepsToReproduce());
        bug.setPriority(request.getPriority());
        bug.setIssueType(request.getIssueType() != null ? request.getIssueType() : IssueType.BUG);
        bug.setStatus(Status.OPEN);
        bug.setReporter(reporter);

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            bug.setAssignee(assignee);
        }

        return bugRepository.save(bug);
    }

    public List<Bug> getBugsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getRole() == Role.DEVELOPER) {
            return bugRepository.findByAssigneeId(user.getId());
        }
        // Admin and Tester see all
        return bugRepository.findAll();
    }

    public Bug updateStatus(Long bugId, Status status, String username) {
        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new RuntimeException("Bug not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getRole() == Role.DEVELOPER) {
            if (bug.getStatus() == Status.OPEN && status == Status.IN_REVIEW) {
                // allowed
            } else {
                throw new RuntimeException("Developers can only transition issues from OPEN to IN_REVIEW.");
            }
        } else if (user.getRole() == Role.TESTER) {
            if (bug.getStatus() == Status.IN_REVIEW && status == Status.TESTING) {
                // allowed
            } else if (bug.getStatus() == Status.TESTING && status == Status.CLOSED) {
                // allowed
            } else {
                throw new RuntimeException("Testers can only transition issues from IN_REVIEW to TESTING, or TESTING to CLOSED.");
            }
        }

        bug.setStatus(status);
        return bugRepository.save(bug);
    }

    public Bug getBugById(Long bugId) {
        return bugRepository.findById(bugId)
                .orElseThrow(() -> new RuntimeException("Bug not found"));
    }

    public Comment addComment(Long bugId, String text, String username) {
        Bug bug = bugRepository.findById(bugId).orElseThrow(() -> new RuntimeException("Bug not found"));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Comment comment = new Comment();
        comment.setBug(bug);
        comment.setUser(user);
        comment.setText(text);
        
        return commentRepository.save(comment);
    }

    public List<Comment> getComments(Long bugId) {
        return commentRepository.findByBugIdOrderByCreatedAtDesc(bugId);
    }

    public void deleteBug(Long bugId) {
        if (!bugRepository.existsById(bugId)) {
            throw new RuntimeException("Bug not found");
        }
        bugRepository.deleteById(bugId);
    }
}
