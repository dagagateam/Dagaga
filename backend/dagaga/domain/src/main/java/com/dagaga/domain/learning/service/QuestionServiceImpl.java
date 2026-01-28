package com.dagaga.domain.learning.service;

import com.dagaga.domain.learning.dto.QuestionResponse;
import com.dagaga.domain.learning.entity.QuestionBank;
import com.dagaga.domain.learning.repository.QuestionBankRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionServiceImpl implements QuestionService {

    private final QuestionBankRepository questionBankRepository;

    @Override
    public List<QuestionResponse> getQuestionsByCategory(String category) {
        log.info("Fetching questions for category: {}", category);
        
        List<QuestionBank> questions = questionBankRepository.findByCategoryOrderByOrderIndex(category);
        
        return questions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private QuestionResponse convertToDto(QuestionBank entity) {
        return QuestionResponse.builder()
                .questionId(entity.getQuestionId())
                .category(entity.getCategory())
                .questionText(entity.getQuestionText())
                .exampleAnswer(entity.getExampleAnswer())
                .orderIndex(entity.getOrderIndex())
                .build();
    }
}
