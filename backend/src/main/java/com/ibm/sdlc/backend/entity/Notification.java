package com.ibm.sdlc.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user; // the recipient of the notification

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bug_id")
    @JsonIgnoreProperties({"subTasks", "parentBug", "comments", "reporter", "assignee", "project", "sprint", "attachments", "hibernateLazyInitializer", "handler"})
    private Bug bug; // the bug this relates to

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
