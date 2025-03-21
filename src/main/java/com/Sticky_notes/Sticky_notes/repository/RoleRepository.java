package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findByName(String name);  // Optional: If you need to look up roles by their name
}
