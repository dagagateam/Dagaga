pipeline {
    agent any

    environment {
        DOCKER_HUB_ID = 'arinkkk'
        BE_IMAGE = "${DOCKER_HUB_ID}/dagaga-backend:latest"
        FE_IMAGE = "${DOCKER_HUB_ID}/dagaga-frontend:latest"
    }

    stages {
        stage('Debug Info') {
            steps {
                echo "gitlabBranch: ${env.gitlabBranch}"
                echo "env.BRANCH_NAME: ${env.BRANCH_NAME}"
                echo "env.GIT_BRANCH: ${env.GIT_BRANCH}"
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Backend') {
            when {
                anyOf {
                    branch 'develop'
                    expression { env.GIT_BRANCH?.endsWith('develop') }
                }
            }
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        dir('backend/dagaga') {
                            sh "docker build --platform linux/amd64 -t ${BE_IMAGE} ."
                            sh "docker push ${BE_IMAGE}"
                        }
                    }
                }
            }
        }

        stage('Build & Push Frontend') {
            when {
                anyOf {
                    branch 'develop'
                    expression { env.GIT_BRANCH?.endsWith('develop') }
                }
            }
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        dir('frontend/dagaga') {
                            sh "docker build --platform linux/amd64 -t ${FE_IMAGE} ."
                            sh "docker push ${FE_IMAGE}"
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch 'develop'
                    expression { env.GIT_BRANCH?.endsWith('develop') }
                }
            }
            steps {
                // 기존 컨테이너를 강제로 중지 및 제거 후 새로운 이미지로 재시작
                sh 'docker compose down || true'
                sh 'docker rm -f dagaga-backend dagaga-frontend || true'
                sh 'docker compose pull'
                sh 'docker compose up -d'
            }
        }

        stage('Cleanup') {
            steps {
                // 사용하지 않는 이미지 및 빌드 캐시 정리
                sh 'docker system prune -f'
            }
        }
    }

    post {
        success {
            sh """
                curl -X POST https://meeting.ssafy.com/hooks/7w6wbucw8pdoirpdfpras3xyja \
                  -H 'Content-Type: application/json' \
                  -d '{"text": "✅ Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}"}'
            """
        }
        failure {
            sh """
                curl -X POST https://meeting.ssafy.com/hooks/7w6wbucw8pdoirpdfpras3xyja \
                  -H 'Content-Type: application/json' \
                  -d '{"text": "❌ Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}"}'
            """
        }
        always {
            // 빌드 이력 및 로그 관리 (Jenkins 전역 설정에서도 가능)
            cleanWs()
        }
    }
}
