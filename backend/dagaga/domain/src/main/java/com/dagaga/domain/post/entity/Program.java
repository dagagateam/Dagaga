package com.dagaga.domain.post.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "programs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "program_id")
    private Integer programId;

    @Column(name = "article_seq", unique = true, nullable = false)
    private Integer articleSeq;

    @Column(name = "program_region")
    private String programRegion;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "target")
    private String target;

    @Column(name = "capacity")
    private String capacity;

    @Column(name = "contact")
    private String contact;

    @Column(name = "status")
    private String status;

    @Column(name = "reg_start_date")
    private String regStartDate;

    @Column(name = "reg_end_date")
    private String regEndDate;

    @Column(name = "prog_start_date")
    private String progStartDate;

    @Column(name = "prog_end_date")
    private String progEndDate;

    @Column(name = "content_text")
    private String contentText;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
