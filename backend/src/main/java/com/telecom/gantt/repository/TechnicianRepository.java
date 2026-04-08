package com.telecom.gantt.repository;

import com.telecom.gantt.model.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    List<Technician> findByMarketId(Long marketId);
    List<Technician> findByMarketTerritoryId(Long territoryId);
}
