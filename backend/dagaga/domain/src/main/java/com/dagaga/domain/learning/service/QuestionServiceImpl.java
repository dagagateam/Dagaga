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

    @Override
    public String getQuestionText(String category, Integer orderIndex) {
        log.info("Fetching question text for category: {}, orderIndex: {}", category, orderIndex);
        
        return questionBankRepository.findByCategoryAndOrderIndex(category, orderIndex)
                .map(QuestionBank::getQuestionText)
                .orElseThrow(() -> new IllegalArgumentException(
                        String.format("질문을 찾을 수 없습니다. (카테고리: %s, 순서: %d)", category, orderIndex)
                ));
    }

    @Override
    public com.dagaga.domain.learning.dto.QuestionWithExampleResponse getQuestionWithExample(String category, Integer orderIndex, String countryCode) {
        log.info("Fetching question with example for category: {}, orderIndex: {}, countryCode: {}", category, orderIndex, countryCode);
        
        QuestionBank question = questionBankRepository.findByCategoryAndOrderIndex(category, orderIndex)
                .orElseThrow(() -> new IllegalArgumentException(
                        String.format("질문을 찾을 수 없습니다. (카테고리: %s, 순서: %d)", category, orderIndex)
                ));
        
        // 기본 빌더 생성
        var builder = com.dagaga.domain.learning.dto.QuestionWithExampleResponse.builder()
                .questionText(question.getQuestionText())
                .exampleAnswer(question.getExampleAnswer());
        
        // countryCode에 따라 지역별 데이터 선택적으로 추가
        if ("vi".equalsIgnoreCase(countryCode)) {
            builder.viQuestions(question.getViQuestions())
                   .viAnswers(question.getViAnswers());
        } else if ("zh".equalsIgnoreCase(countryCode)) {
            builder.zhQuestions(question.getZhQuestions())
                   .zhAnswers(question.getZhAnswers());
        }
        
        return builder.build();
    }
}
