package com.ibm.sdlc.backend.dto;

import com.ibm.sdlc.backend.entity.IssueType;
import com.ibm.sdlc.backend.entity.Priority;
import lombok.Data;

@Data
public class BugRequest {
    private String title;
    private String description;
    private String stepsToReproduce;
    private Priority priority;
    private IssueType issueType;
    private Long assigneeId;
}
