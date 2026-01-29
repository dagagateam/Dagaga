package com.dagaga;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DagagaApplication {
    public static void main(String[] args) {

        // 로컬 개발 환경에서 .env 파일을 로드하기 위함
        // .env 파일이 없으면 무시하고 실행
        // 배포시에는 환경 변수를 주입하므로 해당 메소드 수정 불필요
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();
        
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });

        SpringApplication.run(DagagaApplication.class, args);
    }
}
