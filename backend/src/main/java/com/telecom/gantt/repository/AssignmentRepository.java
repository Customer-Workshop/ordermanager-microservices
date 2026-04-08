package com.telecom.gantt.repository;

import com.telecom.gantt.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByAssignmentDate(LocalDate date);

    List<Assignment> findByTechnicianIdAndAssignmentDate(Long technicianId, LocalDate date);

    @Query("SELECT a FROM Assignment a WHERE a.technician.market.id = :marketId AND a.assignmentDate = :date ORDER BY a.technician.id, a.startTime")
    List<Assignment> findByMarketAndDate(@Param("marketId") Long marketId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Assignment a WHERE a.technician.market.territory.id = :territoryId AND a.assignmentDate = :date ORDER BY a.technician.id, a.startTime")
    List<Assignment> findByTerritoryAndDate(@Param("territoryId") Long territoryId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Assignment a WHERE a.technician.market.id IN :marketIds AND a.assignmentDate = :date ORDER BY a.technician.id, a.startTime")
    List<Assignment> findByMarketIdsAndDate(@Param("marketIds") List<Long> marketIds, @Param("date") LocalDate date);
}
