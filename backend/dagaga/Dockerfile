# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /home/gradle/project

# Copy Gradle wrapper and settings
COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .

# Copy all subproject build files to cache dependencies
COPY app/build.gradle app/
COPY chat/build.gradle chat/
COPY common/build.gradle common/
COPY domain/build.gradle domain/
COPY infra/build.gradle infra/

# Download dependencies (this will fail but cache most of the layers)
RUN ./gradlew build -x test --no-daemon || true

# Copy full source
COPY . .

# Build only the application module
RUN ./gradlew :app:bootJar --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the JAR from the build stage
COPY --from=build /home/gradle/project/app/build/libs/*.jar app.jar

# Application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul", "-jar", "app.jar"]
