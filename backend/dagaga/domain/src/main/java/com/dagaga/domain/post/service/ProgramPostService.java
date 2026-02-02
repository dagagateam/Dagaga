package com.dagaga.domain.post.service;

import com.dagaga.domain.post.dto.ProgramPostDetailResponse;
import com.dagaga.domain.post.dto.ProgramPostResponse;
import com.dagaga.domain.post.entity.Location;
import com.dagaga.domain.post.entity.Post;
import com.dagaga.domain.post.entity.Program;
import com.dagaga.domain.post.entity.ProgramImage;
import com.dagaga.domain.post.repository.LocationRepository;
import com.dagaga.domain.post.repository.PostRepository;
import com.dagaga.domain.post.repository.ProgramImageRepository;
import com.dagaga.domain.post.repository.ProgramRepository;
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

    private static final String DEFAULT_CATEGORY = "PROGRAM";
    private static final Integer ADMIN_USER_ID = 1; // Assuming admin user ID is 1

    /**
     * 특정 프로그램 게시글 상세 내용을 조회합니다.
     */
    @Transactional
    public ProgramPostDetailResponse getProgramPostDetail(Integer postId) {
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

        return ProgramPostDetailResponse.builder()
                .postId(post.getPostId())
                .category(post.getCategory())
                .contact(program != null ? program.getContact() : null)
                .title(post.getTitle())
                .content(post.getContent())
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
     */
    @Transactional
    public void syncProgramsToPosts() {
        programRepository.findAll().forEach(program -> {
            Optional<Post> existingPost = postRepository.findByArticleSeq(program.getArticleSeq());
            if (existingPost.isEmpty()) {
                createPostFromProgram(program);
            }
        });
    }

    /**
     * 프로그램 하나를 게시글로 변환하여 저장합니다.
     */
    private void createPostFromProgram(Program program) {
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

        postRepository.save(post);
        log.info("Created post with {} images for articleSeq: {}", imageUrls.size(), program.getArticleSeq());
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
     */
    @Transactional(readOnly = true)
    public Page<ProgramPostResponse> getProgramPosts(Integer locationId, Pageable pageable) {
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

        return posts.map(post -> {
            Program program = programMap.get(post.getArticleSeq());
            List<String> imageUrls = imageMap.getOrDefault(post.getArticleSeq(),
                    Collections.emptyList());

            return ProgramPostResponse.builder()
                    .postId(post.getPostId())
                    .category(post.getCategory())
                    .contact(program != null ? program.getContact() : null)
                    .title(post.getTitle())
                    .locationId(post.getLocationId())
                    .viewCount(post.getViewCount())
                    .createdAt(post.getCreatedAt())
                    .updatedAt(program != null ? program.getUpdatedAt() : post.getCreatedAt())
                    .capacity(program != null ? program.getCapacity() : null)
                    .imageUrls(imageUrls)
                    .build();
        });
    }
}
