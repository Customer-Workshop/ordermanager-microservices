package com.telecom.gantt.repository;

import com.telecom.gantt.model.Market;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketRepository extends JpaRepository<Market, Long> {
    List<Market> findByTerritoryId(Long territoryId);
}
