package com.ibm.sdlc.backend.repository;

import com.ibm.sdlc.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
