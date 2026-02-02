package com.dagaga.domain.learning.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "question_bank")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class QuestionBank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Integer questionId;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "example_answer", nullable = false, columnDefinition = "TEXT")
    private String exampleAnswer;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "vite_questions", columnDefinition = "TEXT")
    private String viteQuestions;

    @Column(name = "vite_answers", columnDefinition = "TEXT")
    private String viteAnswers;

    @Column(name = "chz_questions", columnDefinition = "TEXT")
    private String chzQuestions;

    @Column(name = "chz_answers", columnDefinition = "TEXT")
    private String chzAnswers;
}
