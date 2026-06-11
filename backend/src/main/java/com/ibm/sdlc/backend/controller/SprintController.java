package com.ibm.sdlc.backend.controller;

import com.ibm.sdlc.backend.entity.Bug;
import com.ibm.sdlc.backend.entity.Project;
import com.ibm.sdlc.backend.entity.Sprint;
import com.ibm.sdlc.backend.entity.SprintStatus;
import com.ibm.sdlc.backend.repository.BugRepository;
import com.ibm.sdlc.backend.repository.ProjectRepository;
import com.ibm.sdlc.backend.repository.SprintRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final BugRepository bugRepository;

    public SprintController(SprintRepository sprintRepository, ProjectRepository projectRepository, BugRepository bugRepository) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
        this.bugRepository = bugRepository;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Sprint>> getSprintsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(sprintRepository.findByProjectId(projectId));
    }

    @PostMapping("/project/{projectId}")
    public ResponseEntity<Sprint> createSprint(@PathVariable Long projectId, @RequestBody Sprint sprint) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        sprint.setProject(project);
        return ResponseEntity.ok(sprintRepository.save(sprint));
    }

    @PutMapping("/{sprintId}/status")
    public ResponseEntity<Sprint> updateSprintStatus(@PathVariable Long sprintId, @RequestParam SprintStatus status) {
        Sprint sprint = sprintRepository.findById(sprintId).orElseThrow();
        sprint.setStatus(status);
        return ResponseEntity.ok(sprintRepository.save(sprint));
    }

    @PostMapping("/{sprintId}/bugs/{bugId}")
    public ResponseEntity<Bug> assignBugToSprint(@PathVariable Long sprintId, @PathVariable Long bugId) {
        Sprint sprint = sprintRepository.findById(sprintId).orElseThrow();
        Bug bug = bugRepository.findById(bugId).orElseThrow();
        bug.setSprint(sprint);
        return ResponseEntity.ok(bugRepository.save(bug));
    }
}
