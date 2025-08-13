# Estágio de Build
FROM gradle:jdk21-jammy AS build
WORKDIR /app
COPY --chown=gradle:gradle . .
RUN chmod +x gradlew
RUN ./gradlew clean build --no-daemon -x test

# Estágio de Runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /app/build/libs/pagamento-restapi-0.0.1-SNAPSHOT.jar /app/app.jar

ARG CORS_ALLOWED_ORIGIN

EXPOSE 8080

ENTRYPOINT ["java", \
    "-Dspring.data.mongodb.host=${SPRING_DATA_MONGODB_HOST}", \
    "-Dspring.data.mongodb.database=${SPRING_DATA_MONGODB_DATABASE}", \
    "-Dspring.data.mongodb.username=${SPRING_DATA_MONGODB_USERNAME}", \
    "-Dspring.data.mongodb.password=${SPRING_DATA_MONGODB_PASSWORD}", \
    "-Dspring.kafka.bootstrap-servers=${SPRING_KAFKA_BOOTSTRAP_SERVERS}", \
    "-Dcors.allowed-origins=${CORS_ALLOWED_ORIGIN}", \
    "-jar", "app.jar"]