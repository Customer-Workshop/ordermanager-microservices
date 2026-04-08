package com.telecom.gantt.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "territories")
public class Territory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @OneToMany(mappedBy = "territory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Market> markets = new ArrayList<>();

    public Territory() {}

    public Territory(String name, String code) {
        this.name = name;
        this.code = code;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public List<Market> getMarkets() { return markets; }
    public void setMarkets(List<Market> markets) { this.markets = markets; }
}
