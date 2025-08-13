# API de Pagamentos - Back-end

Este projeto é o back-end da aplicação de pagamentos, construído com Java 21, Spring Boot, MongoDB e Apache Kafka, orquestrados via Docker Compose. O projeto utiliza o Gradle com Kotlin DSL como ferramenta de build.

## Requisitos

- Java 21 ou superior
- Docker e Docker Compose

## Estrutura do Projeto

A estrutura do projeto segue as convenções do Spring Boot e Gradle:

- `src/main/java/com/fadesp/pagamento/api`: Contém o código-fonte da aplicação.
- `src/main/resources`: Contém os arquivos de configuração.
- `src/test/java/com/fadesp/pagamento/api`: Contém os testes unitários.
- `build.gradle.kts`: Arquivo de dependências e configuração de build do projeto Gradle.
- `settings.gradle.kts`: Arquivo de configurações do projeto Gradle.
- `Dockerfile`: Instruções para a construção da imagem Docker da API.
- `docker-compose.yml`: Arquivo para orquestrar os serviços (API, MongoDB, Kafka, Zookeeper).

## Como Rodar a Aplicação

1.  **Suba os contêineres com Docker Compose**:
    ```bash
    docker-compose up --build
    ```
    Este comando irá construir a imagem Docker da API, iniciar os serviços do MongoDB, Zookeeper e Kafka, e então subir a sua API, conectando todos os serviços na rede `pagamento-network`. O build da aplicação será feito automaticamente pelo Dockerfile.

2.  **Acesse a API**:
    A API estará disponível em `http://localhost:8080`.

## Endpoints da API

-   **`POST /pagamentos`**: Cria um novo pagamento.
    -   Body: `{ "idPagamento": ..., "cpfCnpj": ..., "metodoPagamento": ..., "valor": ... }`
-   **`GET /pagamentos/lista`**: Lista todos os pagamentos.
-   **`GET /pagamentos/lista?idPagamento=...&cpfCnpj=...&status=...`**: Lista pagamentos com filtros.
-   **`PUT /pagamentos/status`**: Atualiza o status de um pagamento através de uma mensagem Kafka.
    -   Body: `{ "idPagamento": ..., "novoStatus": "..." }`
-   **`DELETE /pagamentos/{id}`**: Exclui logicamente um pagamento pelo ID.

## Testes Unitários

Para rodar os testes unitários, você pode usar o wrapper do Gradle:

```bash
./gradlew test
