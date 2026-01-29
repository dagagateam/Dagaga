package com.dagaga.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "locations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    private Integer locationId;

    @Column(name = "parent_id")
    private Integer parentId;

    @Column(name = "district_name", nullable = false)
    private String districtName;

    @Column(name = "depth", nullable = false)
    private Integer depth;
}
