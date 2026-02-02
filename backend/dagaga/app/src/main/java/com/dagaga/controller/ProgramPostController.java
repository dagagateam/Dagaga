package com.dagaga.controller;

import com.dagaga.common.constants.ApiConstants;
import com.dagaga.common.response.ApiResponse;
import com.dagaga.domain.post.dto.CommentCreateRequest;
import com.dagaga.domain.post.dto.CommentResponse;
import com.dagaga.domain.post.dto.ProgramPostDetailResponse;
import com.dagaga.domain.post.dto.ProgramPostResponse;
import com.dagaga.domain.post.service.CommentService;
import com.dagaga.domain.post.service.ProgramPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/community/programs")
@RequiredArgsConstructor
@Tag(name = "Program Post API", description = "다누리 크롤링 기반 프로그램 게시글 API")
public class ProgramPostController {

        private final ProgramPostService programPostService;
        private final CommentService commentService;

        @Operation(summary = "프로그램 게시글 목록 조회", description = "크롤링된 행사 정보를 공지사항 형태로 조회합니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.SUCCESS_CODE, description = "조회 성공", content = @Content(schema = @Schema(implementation = Page.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.BAD_REQUEST_CODE, description = "잘못된 요청"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.INTERNAL_SERVER_ERROR_CODE, description = "서버 내부 오류")
        })
        @GetMapping
        public ResponseEntity<ApiResponse<Page<ProgramPostResponse>>> getProgramPosts(
                        @Parameter(description = "페이지 번호 (기본 0)") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "페이지 크기 (기본 10)") @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<ProgramPostResponse> response = programPostService.getProgramPosts(pageable);
                return ResponseEntity.ok(ApiResponse.success("프로그램 게시글 조회가 완료되었습니다.", response));
        }

        @Operation(summary = "프로그램 게시글 상세 조회", description = "특정 프로그램 게시글의 상세 내용을 조회합니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.SUCCESS_CODE, description = "조회 성공", content = @Content(schema = @Schema(implementation = ProgramPostDetailResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.BAD_REQUEST_CODE, description = "게시글을 찾을 수 없음"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.INTERNAL_SERVER_ERROR_CODE, description = "서버 내부 오류")
        })
        @GetMapping("/{postId}")
        public ResponseEntity<ApiResponse<ProgramPostDetailResponse>> getProgramPostDetail(
                        @PathVariable Integer postId) {
                ProgramPostDetailResponse response = programPostService.getProgramPostDetail(postId);
                return ResponseEntity.ok(ApiResponse.success("프로그램 게시글 상세 조회가 완료되었습니다.", response));
        }

        // TODO: 데이터 동기화를 API 요청으로 해결해야하나? Scheduler + ShedLock으로 하면 안됨?
        @Operation(summary = "프로그램 데이터 동기화", description = "크롤링된 프로그램 데이터를 기반으로 게시글을 생성합니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.SUCCESS_CODE, description = "동기화 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.INTERNAL_SERVER_ERROR_CODE, description = "서버 내부 오류")
        })
        @PostMapping("/sync")
        public ResponseEntity<ApiResponse<Void>> syncPrograms() {
                programPostService.syncProgramsToPosts();
                return ResponseEntity.ok(ApiResponse.success("프로그램 데이터 동기화가 완료되었습니다.", null));
        }

        @Operation(summary = "댓글 작성", description = "프로그램 게시글에 댓글 또는 대댓글을 작성합니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.SUCCESS_CODE, description = "댓글 작성 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.BAD_REQUEST_CODE, description = "유효성 검사 실패")
        })
        @PostMapping("/{postId}/comments")
        public ResponseEntity<ApiResponse<Void>> createComment(
                        @PathVariable Integer postId,
                        @jakarta.validation.Valid @RequestBody CommentCreateRequest request) {
                commentService.createComment(postId, request);
                return ResponseEntity.ok(ApiResponse.success("댓글이 작성되었습니다.", null));
        }

        @Operation(summary = "댓글 목록 조회", description = "특정 게시글의 모든 댓글과 대댓글을 계층 구조로 조회합니다.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = ApiConstants.SUCCESS_CODE, description = "조회 성공")
        })
        @GetMapping("/{postId}/comments")
        public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
                        @PathVariable Integer postId) {
                var response = commentService.getComments(postId);
                return ResponseEntity.ok(ApiResponse.success("댓글 조회가 완료되었습니다.", response));
        }
}
