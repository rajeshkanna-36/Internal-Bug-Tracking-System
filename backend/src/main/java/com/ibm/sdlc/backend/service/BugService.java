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

    public BugService(BugRepository bugRepository, UserRepository userRepository) {
        this.bugRepository = bugRepository;
        this.userRepository = userRepository;
    }

    public Bug createBug(BugRequest request, String reporterUsername) {
        User reporter = userRepository.findByUsername(reporterUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Bug bug = new Bug();
        bug.setTitle(request.getTitle());
        bug.setDescription(request.getDescription());
        bug.setStepsToReproduce(request.getStepsToReproduce());
        bug.setPriority(request.getPriority());
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
        // In a real app, verify permissions here (e.g., proper state transitions)
        Bug bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new RuntimeException("Bug not found"));

        bug.setStatus(status);
        return bugRepository.save(bug);
    }

    public Bug getBugById(Long bugId) {
        return bugRepository.findById(bugId)
                .orElseThrow(() -> new RuntimeException("Bug not found"));
    }
}
