package com.telecom.gantt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "technicians")
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tech_id", nullable = false, unique = true)
    private String techId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String skills;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    @Column(name = "market_id", insertable = false, updatable = false)
    private Long marketId;

    public Technician() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTechId() { return techId; }
    public void setTechId(String techId) { this.techId = techId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public Market getMarket() { return market; }
    public void setMarket(Market market) { this.market = market; }

    public Long getMarketId() { return marketId; }
    public void setMarketId(Long marketId) { this.marketId = marketId; }
}
