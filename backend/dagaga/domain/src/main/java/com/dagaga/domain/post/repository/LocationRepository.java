package com.dagaga.domain.post.repository;

import com.dagaga.domain.post.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Integer> {
    Optional<Location> findByDistrictNameAndDepth(String districtName, Integer depth);
}
