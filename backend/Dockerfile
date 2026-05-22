# ── Etapa 1: compilar con Maven ───────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Descargar dependencias primero (mejor uso del cache de capas)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compilar el proyecto
COPY src ./src
RUN mvn package -DskipTests -B

# ── Etapa 2: imagen de runtime mínima ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Usuario no-root por seguridad
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
