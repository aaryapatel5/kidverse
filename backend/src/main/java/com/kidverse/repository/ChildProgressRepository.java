package com.kidverse.repository;

import com.kidverse.entity.ChildProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChildProgressRepository extends JpaRepository<ChildProgress, Long> {
    Optional<ChildProgress> findByChildId(Long childId);
    Optional<ChildProgress> findByChildUsername(String username);
}
