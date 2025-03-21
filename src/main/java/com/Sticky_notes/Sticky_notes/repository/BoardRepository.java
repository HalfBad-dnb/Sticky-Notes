package com.Sticky_notes.Sticky_notes.repository;

import com.Sticky_notes.Sticky_notes.models.Board;
import com.Sticky_notes.Sticky_notes.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
   
   
    //Find by user and code
    Optional<Board> findByCode(String code);
    List<Board> findByUser(User user);
    

}
