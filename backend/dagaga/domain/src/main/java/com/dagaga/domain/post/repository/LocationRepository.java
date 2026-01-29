package com.dagaga.domain.post.repository;

import com.dagaga.domain.post.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Integer> {
    List<Location> findByDistrictNameAndDepth(String districtName, Integer depth);

    @Query("SELECT l FROM Location l WHERE l.districtName = :districtName AND l.depth = :depth AND l.parentId IN (SELECT p.locationId FROM Location p WHERE p.districtName LIKE %:parentName%)")
    List<Location> findByDistrictNameAndDepthAndParentName(@Param("districtName") String districtName,
            @Param("depth") Integer depth, @Param("parentName") String parentName);
}
