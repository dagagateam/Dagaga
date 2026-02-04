package com.dagaga.domain.learning.service;

import com.dagaga.domain.learning.dto.QuestionResponse;
import com.dagaga.domain.learning.dto.QuestionWithExampleResponse;
import com.dagaga.domain.learning.dto.NativeQuestionResponse;
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
        public List<QuestionResponse> getQuestionsByCategory(String category, String viewLangCode) {
                log.info("Fetching questions for category: {} with nativeLangcode: {}", category, viewLangCode);

                List<QuestionBank> questions = questionBankRepository.findByCategoryOrderByOrderIndex(category);

                return questions.stream()
                                .map(question -> convertToDto(question, viewLangCode))
                                .collect(Collectors.toList());
        }

        private QuestionResponse convertToDto(QuestionBank entity, String nativeLangCode) {
                // nativeLangCode에 따라 viewQuestions 필드 설정
                String viewQuestions = null;
                if ("vi".equalsIgnoreCase(nativeLangCode)) {
                        viewQuestions = entity.getViQuestions();
                } else if ("zh".equalsIgnoreCase(nativeLangCode)) {
                        viewQuestions = entity.getZhQuestions();
                } else {
                        viewQuestions = entity.getQuestionText();
                }

                return QuestionResponse.builder()
                                .questionId(entity.getQuestionId())
                                .category(entity.getCategory())
                                .questionText(entity.getQuestionText())
                                .orderIndex(entity.getOrderIndex())
                                .viewQuestions(viewQuestions)
                                .build();
        }

        @Override
        public QuestionWithExampleResponse getQuestionWithExample(String category,
                        Integer orderIndex, String nativeLangCode) {
                log.info("Fetching question with example for category: {}, orderIndex: {}, nativeLangCode: {}",
                                category, orderIndex, nativeLangCode);

                QuestionBank question = questionBankRepository.findByCategoryAndOrderIndex(category, orderIndex)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                String.format("질문을 찾을 수 없습니다. (카테고리: %s, 순서: %d)", category,
                                                                orderIndex)));

                // 기본 빌더 생성
                var builder = QuestionWithExampleResponse.builder()
                                .questionText(question.getQuestionText())
                                .exampleAnswer(question.getExampleAnswer());

                // nativeLangCode에 따라 지역별 데이터 선택적으로 추가
                if ("vi".equalsIgnoreCase(nativeLangCode)) {
                        builder.viQuestions(question.getViQuestions())
                                        .viAnswers(question.getViAnswers());
                } else if ("zh".equalsIgnoreCase(nativeLangCode)) {
                        builder.zhQuestions(question.getZhQuestions())
                                        .zhAnswers(question.getZhAnswers());
                }

                return builder.build();
        }

        @Override
        public NativeQuestionResponse getQuestionForNativeMode(String category,
                        Integer orderIndex, String nativeLangCode) {
                log.info("Fetching question for native mode - category: {}, orderIndex: {}, nativeLangCode: {}",
                                category, orderIndex, nativeLangCode);

                QuestionBank question = questionBankRepository.findByCategoryAndOrderIndex(category, orderIndex)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                String.format("질문을 찾을 수 없습니다. (카테고리: %s, 순서: %d)", category,
                                                                orderIndex)));

                // 한국어 질문
                String koreanQuestion = question.getQuestionText();

                // 모국어 질문 (nativeLangCode에 따라)
                String nativeQuestion;
                if ("vi".equalsIgnoreCase(nativeLangCode)) {
                        nativeQuestion = question.getViQuestions();
                } else if ("zh".equalsIgnoreCase(nativeLangCode)) {
                        nativeQuestion = question.getZhQuestions();
                } else {
                        // 기본값으로 한국어 질문 사용
                        nativeQuestion = koreanQuestion;
                }

                return NativeQuestionResponse.builder()
                                .koreanQuestion(koreanQuestion)
                                .nativeQuestion(nativeQuestion)
                                .build();
        }
}
