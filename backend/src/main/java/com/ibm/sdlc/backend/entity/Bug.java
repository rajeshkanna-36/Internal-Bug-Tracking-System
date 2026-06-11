package com.ibm.sdlc.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "bugs")
public class Bug {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String stepsToReproduce;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private IssueType issueType = IssueType.BUG;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    @JsonIgnoreProperties({ "password", "hibernateLazyInitializer", "handler" })
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    @JsonIgnoreProperties({ "password", "hibernateLazyInitializer", "handler" })
    private User assignee;

    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({ "owner", "hibernateLazyInitializer", "handler" })
    private Project project;

    @ManyToOne
    @JoinColumn(name = "sprint_id")
    @JsonIgnoreProperties({ "project", "hibernateLazyInitializer", "handler" })
    private Sprint sprint;

    @ManyToOne
    @JoinColumn(name = "parent_bug_id")
    @JsonIgnoreProperties({ "subTasks", "parentBug", "comments", "reporter", "assignee", "project", "sprint", "hibernateLazyInitializer", "handler" })
    private Bug parentBug;

    @OneToMany(mappedBy = "parentBug", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({ "parentBug", "subTasks", "comments", "reporter", "assignee", "project", "sprint", "hibernateLazyInitializer", "handler" })
    private List<Bug> subTasks;

    @OneToMany(mappedBy = "bug", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"bug", "hibernateLazyInitializer", "handler"})
    private List<Attachment> attachments;
}
