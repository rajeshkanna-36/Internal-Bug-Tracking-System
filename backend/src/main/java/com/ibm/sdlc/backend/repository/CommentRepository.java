package com.ibm.sdlc.backend.repository;

import com.ibm.sdlc.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByBugIdOrderByCreatedAtDesc(Long bugId);
}
