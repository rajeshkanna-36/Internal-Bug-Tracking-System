package com.ibm.sdlc.backend.controller;

import com.ibm.sdlc.backend.entity.Bug;
import com.ibm.sdlc.backend.repository.BugRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.cache.annotation.Cacheable;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnalyticsController {

    @Autowired
    private BugRepository bugRepository;

    @GetMapping("/summary")
    @Cacheable("analyticsSummary")
    public Map<String, Object> getAnalyticsSummary() {
        List<Bug> allBugs = bugRepository.findAll();
        
        Map<String, Integer> byStatus = new HashMap<>();
        Map<String, Integer> byPriority = new HashMap<>();
        Map<String, Integer> byAssignee = new HashMap<>();

        for (Bug bug : allBugs) {
            // Status
            String status = bug.getStatus() != null ? bug.getStatus().name() : "UNKNOWN";
            byStatus.put(status, byStatus.getOrDefault(status, 0) + 1);

            // Priority
            String priority = bug.getPriority() != null ? bug.getPriority().name() : "UNKNOWN";
            byPriority.put(priority, byPriority.getOrDefault(priority, 0) + 1);

            // Assignee
            String assignee = bug.getAssignee() != null ? (bug.getAssignee().getName() != null ? bug.getAssignee().getName() : bug.getAssignee().getUsername()) : "Unassigned";
            byAssignee.put(assignee, byAssignee.getOrDefault(assignee, 0) + 1);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("totalIssues", allBugs.size());
        result.put("byStatus", byStatus);
        result.put("byPriority", byPriority);
        result.put("byAssignee", byAssignee);

        return result;
    }
}
