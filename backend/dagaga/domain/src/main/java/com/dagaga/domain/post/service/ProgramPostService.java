package com.dagaga.domain.post.service;

import com.dagaga.domain.post.dto.CommentCreateRequest;
import com.dagaga.domain.post.dto.CommentResponse;
import com.dagaga.domain.post.dto.ProgramPostDetailResponse;
import com.dagaga.domain.post.dto.ProgramPostResponse;
import com.dagaga.domain.post.dto.ProgramTranslationResult;
import com.dagaga.domain.post.entity.Location;
import com.dagaga.domain.post.entity.Post;
import com.dagaga.domain.post.entity.Program;
import com.dagaga.domain.post.entity.ProgramImage;
import com.dagaga.domain.post.entity.ProgramPostTranslation;
import com.dagaga.domain.post.repository.LocationRepository;
import com.dagaga.domain.post.repository.PostRepository;
import com.dagaga.domain.post.repository.ProgramImageRepository;
import com.dagaga.domain.post.repository.ProgramPostTranslationRepository;
import com.dagaga.domain.post.repository.ProgramRepository;
import com.dagaga.domain.chat.language.repository.LanguageRepository;
import com.dagaga.domain.common.translate.port.TranslationPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgramPostService {

    private final PostRepository postRepository;
    private final ProgramRepository programRepository;
    private final LocationRepository locationRepository;
    private final ProgramImageRepository programImageRepository;
    private final ProgramPostTranslationRepository translationRepository;
    private final LanguageRepository languageRepository;
    private final TranslationPort translationPort;

    private static final String DEFAULT_CATEGORY = "PROGRAM";
    private static final Integer ADMIN_USER_ID = 1; // Assuming admin user ID is 1

    /**
     * 특정 프로그램 게시글 상세 내용을 조회합니다.
     * @param postId 게시글 ID
     * @param viewLangCode 사용자의 보기 언어 코드 (vi, zh 등)
     */
    @Transactional
    public ProgramPostDetailResponse getProgramPostDetail(Integer postId, String viewLangCode) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다. (ID: " + postId + ")"));

        // 조회수 증가
        post.incrementViewCount();

        // 관련 프로그램 정보 조회 (프로그램 게시글인 경우)
        Program program = null;
        if (post.getArticleSeq() != null) {
            program = programRepository.findAllByArticleSeqIn(List.of(post.getArticleSeq()))
                    .stream()
                    .findFirst()
                    .orElse(null);
        }

        // 관련 이미지 조회
        List<String> imageUrls = Collections.emptyList();
        if (post.getArticleSeq() != null) {
            imageUrls = programImageRepository.findAllByArticleSeqOrderByImageOrderAsc(post.getArticleSeq())
                    .stream()
                    .map(ProgramImage::getImageUrl)
                    .toList();
        } else if (post.getContentImages() != null) {
            imageUrls = post.getContentImages();
        }

        // 번역본 조회 (viewLangCode가 있고 'ko'가 아닌 경우)
        String title = post.getTitle();
        String content = post.getContent();
        if (viewLangCode != null && !"ko".equalsIgnoreCase(viewLangCode)) {
            Optional<ProgramPostTranslation> translation = translationRepository
                    .findByPost_PostIdAndLanguageCode(postId, viewLangCode.toLowerCase());
            if (translation.isPresent()) {
                title = translation.get().getTitle();
                content = translation.get().getContent();
                log.debug("번역본 사용: postId={}, lang={}", postId, viewLangCode);
            }
        }

        return ProgramPostDetailResponse.builder()
                .postId(post.getPostId())
                .category(post.getCategory())
                .contact(program != null ? program.getContact() : null)
                .title(title)
                .content(content)
                .locationId(post.getLocationId())
                .viewCount(post.getViewCount())
                .createdAt(post.getCreatedAt())
                .updatedAt(program != null ? program.getUpdatedAt() : post.getCreatedAt())
                .capacity(program != null ? program.getCapacity() : null)
                .regStartDate(program != null ? program.getRegStartDate() : null)
                .regEndDate(program != null ? program.getRegEndDate() : null)
                .progStartDate(program != null ? program.getProgStartDate() : null)
                .progEndDate(program != null ? program.getProgEndDate() : null)
                .imageUrls(imageUrls)
                .build();
    }

    /**
     * 모든 프로그램을 게시글로 동기화합니다.
     * 각 프로그램은 독립적인 트랜잭션으로 처리되어 일부 실패해도 성공한 것들은 저장됩니다.
     */
    public void syncProgramsToPosts() {
        List<Program> programs = programRepository.findAll();
        log.info("프로그램 동기화 시작: 총 {} 개", programs.size());
        
        int newPostCount = 0;
        int retryTranslationCount = 0;
        int failCount = 0;
        
        for (Program program : programs) {
            try {
                Optional<Post> existingPost = postRepository.findByArticleSeq(program.getArticleSeq());
                if (existingPost.isEmpty()) {
                    // Post가 없음 -> 새로 생성
                    createPostFromProgramInNewTransaction(program);
                    newPostCount++;
                } else {
                    // Post가 있음 -> 번역이 있는지 체크
                    Post post = existingPost.get();
                    long translationCount = translationRepository.countByPost_PostId(post.getPostId());
                    if (translationCount == 0) {
                        // 번역이 없으면 번역만 재시도
                        log.info("번역 재시도: postId={}, articleSeq={}", post.getPostId(), program.getArticleSeq());
                        retryTranslationsInNewTransaction(post);
                        retryTranslationCount++;
                    } else {
                        log.debug("이미 존재하는 게시글 (번역 포함): articleSeq={}", program.getArticleSeq());
                    }
                }
            } catch (Exception e) {
                failCount++;
                log.error("프로그램 동기화 실패: articleSeq={}", program.getArticleSeq(), e);
                // 실패해도 계속 진행
            }
        }
        
        log.info("프로그램 동기화 완료: 신규 생성 {}, 번역 재시도 {}, 실패 {}", newPostCount, retryTranslationCount, failCount);
    }

    /**
     * 프로그램 하나를 게시글로 변환하여 저장합니다. (별도 트랜잭션)
     * 각 프로그램이 독립적인 트랜잭션으로 처리되어 실패 시 롤백되지 않습니다.
     */
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void createPostFromProgramInNewTransaction(Program program) {
        Integer locationId = mapRegionToLocationId(program.getProgramRegion());

        List<String> imageUrls = programImageRepository
                .findAllByArticleSeqOrderByImageOrderAsc(program.getArticleSeq())
                .stream()
                .map(ProgramImage::getImageUrl)
                .toList();

        Post post = Post.builder()
                .userId(ADMIN_USER_ID)
                .category(DEFAULT_CATEGORY)
                .locationId(locationId)
                .title(program.getTitle())
                .content(program.getContentText())
                .contentImages(imageUrls)
                .articleSeq(program.getArticleSeq())
                .build();

        // saveAndFlush를 사용하여 즉시 DB에 커밋하고 post_id를 할당받음
        Post savedPost = postRepository.saveAndFlush(post);
        log.info("Created post (ID: {}) with {} images for articleSeq: {}", 
                savedPost.getPostId(), imageUrls.size(), program.getArticleSeq());
        
        // 번역 생성 (동기 처리) - savedPost 사용
        createTranslationsForPost(savedPost);
        
        // Rate Limiting: API 호출 제한을 위한 지연 (3초)
        // Gemini API는 분당 요청 제한이 있으므로 충분한 간격 필요
        try {
            Thread.sleep(3000);  // 1초 → 3초로 증가
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Translation rate limiting interrupted");
        }
    }
    
    /**
     * 기존 게시글의 번역을 재시도합니다. (별도 트랜잭션)
     * Post는 있지만 번역 생성에 실패한 경우 사용됩니다.
     */
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void retryTranslationsInNewTransaction(Post post) {
        // 번역 재시도
        createTranslationsForPost(post);
        
        // Rate Limiting: API 호출 제한을 위한 지연 (3초)
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Translation rate limiting interrupted");
        }
    }
    
    /**
     * 게시글의 번역을 생성하여 저장합니다.
     */
    private void createTranslationsForPost(Post post) {
        try {
            List<String> targetLangs = List.of("vi", "zh");
            log.info("프로그램 게시글 번역 시작: postId={}, articleSeq={}", post.getPostId(), post.getArticleSeq());
            
            ProgramTranslationResult result = translationPort.translateProgram(
                    post.getTitle(), 
                    post.getContent(), 
                    targetLangs
            );
            
            if (result != null && result.getTranslations() != null) {
                result.getTranslations().forEach((lang, translated) -> {
                    ProgramPostTranslation translation = ProgramPostTranslation.builder()
                            .post(post)
                            .languageCode(lang)
                            .title(translated.getTitle())
                            .content(translated.getContent())
                            .build();
                    translationRepository.save(translation);
                    log.info("번역 저장 완료: postId={}, lang={}", post.getPostId(), lang);
                });
            }
        } catch (Exception e) {
            log.error("게시글 번역 생성 실패: postId={}", post.getPostId(), e);
        }
    }

    /**
     * 프로그램 지역명을 기반으로 depth 2의 location_id를 찾습니다.
     */
    private Integer mapRegionToLocationId(String programRegion) {
        if (programRegion == null || programRegion.isBlank()) {
            return 1; // Default or global location
        }

        String[] parts = programRegion.split("\\s+");
        if (parts.length >= 2) {
            String parentName = parts[0];
            String districtName = parts[parts.length - 1];

            List<Location> locations = locationRepository
                    .findByDistrictNameAndDepthAndParentName(districtName, 2, parentName);
            if (!locations.isEmpty()) {
                return locations.get(0).getLocationId();
            }
        } else if (parts.length == 1) {
            String districtName = parts[0];
            List<Location> locations = locationRepository.findByDistrictNameAndDepth(districtName, 2);
            if (!locations.isEmpty()) {
                return locations.get(0).getLocationId();
            }
        }

        return 1; // Default
    }

    /**
     * 프로그램 게시글 목록을 조회합니다.
     * @param locationId 지역 ID
     * @param viewLangCode 사용자의 보기 언어 코드
     * @param pageable 페이징 정보
     */
    @Transactional(readOnly = true)
    public Page<ProgramPostResponse> getProgramPosts(Integer locationId, String viewLangCode, Pageable pageable) {
        Page<Post> posts = postRepository.findByCategoryAndLocationId(DEFAULT_CATEGORY, locationId, pageable);

        if (posts.isEmpty()) {
            return Page.empty(pageable);
        }

        // Fetch programs for the posts in current page to optimize
        List<Integer> articleSeqs = posts.getContent().stream()
                .map(Post::getArticleSeq)
                .filter(Objects::nonNull)
                .toList();

        // Fetch programs ONLY for the matching article sequences to optimize
        // performance
        Map<Integer, Program> programMap = programRepository.findAllByArticleSeqIn(articleSeqs).stream()
                .collect(Collectors.toMap(Program::getArticleSeq, p -> p));

        // Fetch multiple images for each program
        Map<Integer, List<String>> imageMap = programImageRepository
                .findAllByArticleSeqIn(articleSeqs).stream()
                .collect(Collectors.groupingBy(
                        ProgramImage::getArticleSeq,
                        Collectors.mapping(ProgramImage::getImageUrl,
                                Collectors.toList())));
        
        // Fetch translations if needed
        Map<Integer, ProgramPostTranslation> translationMap = new HashMap<>();
        if (viewLangCode != null && !"ko".equalsIgnoreCase(viewLangCode)) {
            List<Integer> postIds = posts.getContent().stream()
                    .map(Post::getPostId)
                    .toList();
            translationMap = translationRepository
                    .findByPost_PostIdInAndLanguageCode(postIds, viewLangCode.toLowerCase())
                    .stream()
                    .collect(Collectors.toMap(
                            t -> t.getPost().getPostId(),
                            t -> t,
                            (existing, replacement) -> existing
                    ));
        }
        
        Map<Integer, ProgramPostTranslation> finalTranslationMap = translationMap;

        return posts.map(post -> {
            Program program = programMap.get(post.getArticleSeq());
            List<String> imageUrls = imageMap.getOrDefault(post.getArticleSeq(),
                    Collections.emptyList());
            
            // 번역본이 있으면 번역된 제목 사용
            String title = post.getTitle();
            ProgramPostTranslation translation = finalTranslationMap.get(post.getPostId());
            if (translation != null) {
                title = translation.getTitle();
            }

            return ProgramPostResponse.builder()
                    .postId(post.getPostId())
                    .category(post.getCategory())
                    .contact(program != null ? program.getContact() : null)
                    .title(title)
                    .locationId(post.getLocationId())
                    .viewCount(post.getViewCount())
                    .createdAt(post.getCreatedAt())
                    .updatedAt(program != null ? program.getUpdatedAt() : post.getCreatedAt())
                    .capacity(program != null ? program.getCapacity() : null)
                    .regStartDate(program != null ? program.getRegStartDate() : null)
                    .regEndDate(program != null ? program.getRegEndDate() : null)
                    .progStartDate(program != null ? program.getProgStartDate() : null)
                    .progEndDate(program != null ? program.getProgEndDate() : null)
                    .imageUrls(imageUrls)
                    .build();
        });
    }
}
