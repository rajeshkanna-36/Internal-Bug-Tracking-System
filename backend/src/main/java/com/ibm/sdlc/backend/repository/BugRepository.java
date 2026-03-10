package com.ibm.sdlc.backend.repository;

import com.ibm.sdlc.backend.entity.Bug;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BugRepository extends JpaRepository<Bug, Long> {
    List<Bug> findByAssigneeId(Long assigneeId);

    List<Bug> findByReporterId(Long reporterId);
}
