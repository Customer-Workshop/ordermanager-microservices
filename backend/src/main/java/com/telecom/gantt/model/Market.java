package com.telecom.gantt.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "markets")
public class Market {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "territory_id", nullable = false)
    @JsonIgnore
    private Territory territory;

    @Column(name = "territory_id", insertable = false, updatable = false)
    private Long territoryId;

    public Market() {}

    public Market(String name, String code, Territory territory) {
        this.name = name;
        this.code = code;
        this.territory = territory;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Territory getTerritory() { return territory; }
    public void setTerritory(Territory territory) { this.territory = territory; }

    public Long getTerritoryId() { return territoryId; }
    public void setTerritoryId(Long territoryId) { this.territoryId = territoryId; }
}
