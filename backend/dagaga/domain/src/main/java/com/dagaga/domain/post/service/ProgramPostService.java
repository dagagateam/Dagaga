package com.dagaga.domain.post.service;

import com.dagaga.domain.post.dto.ProgramPostResponse;
import com.dagaga.domain.post.entity.Location;
import com.dagaga.domain.post.entity.Post;
import com.dagaga.domain.post.entity.Program;
import com.dagaga.domain.post.repository.LocationRepository;
import com.dagaga.domain.post.repository.PostRepository;
import com.dagaga.domain.post.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgramPostService {

    private final PostRepository postRepository;
    private final ProgramRepository programRepository;
    private final LocationRepository locationRepository;

    private static final String DEFAULT_CATEGORY = "PROGRAM";
    private static final Integer ADMIN_USER_ID = 1; // Assuming admin user ID is 1

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

        Post post = Post.builder()
                .userId(ADMIN_USER_ID)
                .category(DEFAULT_CATEGORY)
                .locationId(locationId)
                .title(program.getTitle())
                .content(program.getContentText())
                .articleSeq(program.getArticleSeq())
                .build();

        postRepository.save(post);
        log.info("Created post for articleSeq: {}", program.getArticleSeq());
    }

    /**
     * 프로그램 지역명을 기반으로 depth 2의 location_id를 찾습니다.
     */
    private Integer mapRegionToLocationId(String programRegion) {
        if (programRegion == null || programRegion.isBlank()) {
            return 1; // Default or global location
        }

        // program_region이 "서울 강남구"와 같은 형식일 수 있으므로 마지막 단어를 추출해봅니다.
        String[] parts = programRegion.split("\\s+");
        String districtName = parts[parts.length - 1];

        return locationRepository.findByDistrictNameAndDepth(districtName, 2)
                .map(Location::getLocationId)
                .orElse(1); // Default to depth 1 or root if not found
    }

    /**
     * 프로그램 게시글 목록을 조회합니다.
     */
    @Transactional(readOnly = true)
    public Page<ProgramPostResponse> getProgramPosts(Pageable pageable) {
        Page<Post> posts = postRepository.findByCategory(DEFAULT_CATEGORY, pageable);

        if (posts.isEmpty()) {
            return Page.empty(pageable);
        }

        // Fetch programs for the posts in current page to optimize
        java.util.List<Integer> articleSeqs = posts.getContent().stream()
                .map(Post::getArticleSeq)
                .filter(java.util.Objects::nonNull)
                .toList();

        // Fetch programs ONLY for the matching article sequences to optimize
        // performance
        java.util.Map<Integer, Program> programMap = programRepository.findAllByArticleSeqIn(articleSeqs).stream()
                .collect(java.util.stream.Collectors.toMap(Program::getArticleSeq, p -> p));

        return posts.map(post -> {
            Program program = programMap.get(post.getArticleSeq());

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
                    .build();
        });
    }
}
