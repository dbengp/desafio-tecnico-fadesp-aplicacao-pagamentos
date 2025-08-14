# **💳 Sistema de Gerenciamento de Pagamentos**

## **Visão Geral do Projeto**

Este projeto é uma aplicação web full-stack desenvolvida para simular um sistema de recebimento e processamento de pagamentos. Ele permite o registro, listagem, filtragem e gerenciamento de pagamentos de pessoas físicas e jurídicas, demonstrando um fluxo de processamento de pagamentos robusto e assíncrono. O backend é uma API RESTful construída com Spring Boot, enquanto o frontend é uma aplicação web dinâmica desenvolvida em Angular.

O objetivo principal da aplicação é permitir o cadastro, visualização, filtragem e gerenciamento de pagamentos. O back-end expõe uma API REST para manipular os dados, enquanto o front-end fornece uma interface de usuário intuitiva para interagir com a API.

## **🚀 Tecnologias e Ferramentas**

### **Backend (Java com Spring Boot)**

* **Java 21**: Linguagem de programação.  
* **Spring Boot 3.5.4**: Framework para construção da API REST.  
* **Spring Web**: Para criar os endpoints REST.  
* **Spring Data MongoDB**: Para persistência de dados no banco de dados MongoDB.  
* **Spring Kafka**: Para a integração com o Apache Kafka.  
* **Springdoc OpenAPI (Swagger)**: Para a documentação interativa da API.  
* **Lombok**: Para simplificar o código com anotações.  
* **Gradle**: Ferramenta de automação de build.  
* **Testes Unitários**: Junit e Mockito.

### **Frontend (Angular)**

* **Angular 18**: Framework para o desenvolvimento da interface de usuário em modo standalone.  
* **TypeScript**: Linguagem de programação.  
* **Tailwind CSS**: Framework CSS para estilização rápida e responsiva.  
* **RxJS**: Para programação reativa.  
* **Jasmine & Karma**: Para testes unitários.

### **Outras Tecnologias e Ferramentas**
  
* **Nginx**: Servidor web para servir a aplicação front-end e atuar como proxy reverso para a API.
* **Kafka**: Plataforma de streaming de eventos para processamento assíncrono.  
* **MongoDB**: Banco de dados NoSQL para persistência dos dados de pagamentos.  
* **Docker e Docker Compose**: Para conteinerização e orquestração de todos os serviços.

## **🌟 Funcionalidades**

O sistema oferece as seguintes funcionalidades principais:

* **CRUD de Pagamentos**:  
  * **Criar Pagamento (POST /pagamentos)**: Permite adicionar um novo pagamento com os dados do cliente, método de pagamento, valor e número do cartão (se aplicável). O pagamento é salvo inicialmente com o status PENDENTE\_PROCESSAMENTO.  
  * **Listar e Filtrar Pagamentos (GET /pagamentos/lista)**: Exibe todos os pagamentos ativos, com a possibilidade de filtrar por idPagamento, cpfCnpj e status.  
  * **Inativação de Pagamento (DELETE /pagamentos/{id})**: Realiza a exclusão lógica de um pagamento, alterando o campo ativo para false. Esta operação só é permitida se o pagamento estiver com o status PENDENTE\_PROCESSAMENTO.  
* **Processamento de Pagamentos (Assíncrono)**:  
  * **Atualização de Status via Kafka (PUT /pagamentos/status)**: O frontend envia uma requisição para a API, que publica uma mensagem em um tópico Kafka.  
  * O próprio backend atua como um Kafka Consumer, que ouve o tópico e atualiza o status do pagamento no banco de dados, seguindo as regras de negócio:  
    * PENDENTE\_PROCESSAMENTO pode ser alterado para PROCESSADO\_SUCESSO ou PROCESSADO\_FALHA.  
    * PROCESSADO\_FALHA pode voltar para PENDENTE\_PROCESSAMENTO.  
    * PROCESSADO\_SUCESSO não pode ser alterado.  
* **Arquitetura da API**:  
  * Utilização do padrão **MVC (Model-View-Controller)** com separação de responsabilidades em Controller, Service e Repository.  
  * Uso do Spring Data MongoDB para acesso aos dados.  
  * Implementação de um repositório customizado (PagamentoRepositoryImpl) para lidar com a lógica de filtros de busca.  
  * Validações de dados de entrada com @Valid e anotações como @NotNull, @Min, @Pattern, etc.

## **🧠 Arquitetura e Estrutura**

A estrutura de diretórios é dividida em back-end e front-end:

### **Backend**

A arquitetura do backend segue o padrão de camadas, garantindo a separação de responsabilidades:

* **controller** : Camada de entrada que expõe os endpoints REST (PagamentoController).  
* **service**: Camada de lógica de negócio (PagamentoService, PagamentoProducer, PagamentoConsumer).  
* **repository**: Camada de acesso a dados (PagamentoRepository).  
* **persistence**: Pacote que contém os modelos de dados (entidades, enums).  
* **config**: Contém a configuração do CORS para permitir a comunicação com o frontend.

O fluxo de processamento de status demonstra um padrão de arquitetura orientada a eventos. O PagamentoController recebe a requisição de atualização e, em vez de processá-la diretamente, chama o PagamentoProducer para enviar uma mensagem ao Kafka. O PagamentoConsumer ouve essa mensagem e, de forma independente, realiza a atualização no banco de dados, garantindo que o processamento seja desacoplado da requisição HTTP.

A estrutura de packages é a seguinte:

.  
└── pagamentos-restapi  
    └── src  
        └── main  
            └── java  
                └── br.com.fadesp.desafiotecnico.backend.pagamento\_restapi  
                    ├── config  
                    │   └── CorsConfig.java  
                    ├── controller  
                    │   └── PagamentoController.java  
                    ├── persistence  
                    │   ├── model  
                    │   │   ├── MetodoPagamento.java  
                    │   │   ├── PagamentoStatusAtualizacao.java  
                    │   │   └── StatusPagamento.java  
                    │   └── repository  
                    │       ├── PagamentoRepository.java  
                    │       ├── PagamentoRepositoryCustom.java  
                    │       └── PagamentoRepositoryImpl.java  
                    ├── service  
                    │   ├── PagamentoConsumer.java  
                    │   ├── PagamentoProducer.java  
                    │   └── PagamentoService.java  
                    └── PagamentoRestapiApplication.java

### **Frontend**

* **app.component.ts**: Componente raiz da aplicação. Gerencia a abertura e fechamento do modal de formulário e a exibição de toasts. Seu arquivo de testes, app.component.spec.ts, valida seu comportamento.  
* **PagamentoListaComponent**: Exibe a lista de pagamentos com funcionalidade de filtro, busca e paginação. Permite inativar e processar pagamentos. Seu arquivo de testes, pagamento-lista.component.spec.ts, verifica a lógica de carregamento, paginação e ações sobre os pagamentos.  
* **PagamentoFormComponent**: Formulário modal para a criação de novos pagamentos. Seu arquivo de testes, pagamento-form.component.spec.ts, garante a funcionalidade do formulário, validações e emissão de eventos.  
* **ToastComponent**: Componente visual que exibe mensagens de notificação (sucesso/erro) na tela. O arquivo toast.component.spec.ts valida a exibição e o fechamento automático do toast.  
* **PagamentoService**: Serviço Angular que encapsula a comunicação com a API de back-end. O arquivo pagamento.service.spec.ts utiliza o HttpTestingController para testar as requisições HTTP para os diferentes endpoints.  
* **ToastService**: Serviço de notificação que gerencia as mensagens de toast. Seu arquivo de testes, toast.service.spec.ts, assegura que as mensagens são emitidas corretamente.  
* **pagamento.model.ts**: Define a interface de dados para um pagamento.  
* **pagamento-metodo.enum.ts / pagamento-status.enum.ts**: Enumerações para os métodos e status de pagamento.  
* **proxy.config.json**: Configura um proxy para o ambiente de desenvolvimento, redirecionando requisições da URL /api para o back-end em http://localhost:8080.

src/  
├── app/  
│   ├── app.component.html  
│   ├── app.component.spec.ts  
│   ├── app.component.ts  
│   ├── components/  
│   │   ├── pagamento-form/  
│   │   ├── pagamento-lista/  
│   │   └── toast/  
│   ├── models/  
│   │   ├── pagamento-metodo.enum.ts  
│   │   ├── pagamento-status.enum.ts  
│   │   └── pagamento.model.ts  
│   └── services/  
│       ├── pagamento.service.spec.ts  
│       ├── pagamento.service.ts  
│       ├── toast.service.spec.ts  
│       └── toast.service.ts  
├── assets/  
├── environments/  
├── index.html  
├── main.ts  
├── proxy.config.json  
└── styles.css

---
## **Endpoints da API (Back-end)**

A API REST oferece os seguintes endpoints veja a docuemntação em http://localhost:8080/swagger-ui.html:

| Método | Endpoint | Descrição |
| :---- | :---- | :---- |
| POST | /pagamentos | Cria um novo pagamento. |
| GET | /pagamentos/lista | Lista todos os pagamentos com filtros opcionais (idPagamento, cpfCnpj, status). |
|                         | na opção pelos filtros: os filtros opcionais seguem como parametros da requisição.|
| DELETE | /pagamentos/{id} | Inativa um pagamento pelo ID. Requer que o status seja PENDENTE\_PROCESSAMENTO. |
| PUT | /pagamentos/status | Altera o status de um pagamento. Requer um payload com idPagamento e novoStatus. |


## **⚙️ Como Rodar o Projeto**

### **Pré-requisitos**

* Docker e Docker Compose instalados.

### **Passos**

1. **Clone o repositório ou use o conteúdo do arquivo docker-compose.yml em um arquivo de mesmo nome localmente:**  

```
git clone https://github.com/dbengp/desafio-tecnico-fadesp-aplicacao-pagamentos.git 
cd /desafio-tecnico-fadesp-aplicacao-pagamentos
```

2. Inicie os serviços com Docker Compose:  
O arquivo docker-compose.yml irá orquestrar o backend (Spring), o frontend (Angular), o banco de dados (MongoDB) e o serviço de mensageria (Kafka).

```
docker compose up -d 
```

3. **Acesse as Aplicações:**  
   * O frontend estará disponível em http://localhost:4200.  
   * A documentação da API (Swagger UI) estará disponível em http://localhost:8080/swagger-ui.html.

4. **Kafka** : Execute o comando abaixo para simular o processamento de um pagamento e enviar a resposta para o backend. O backend irá consumir esta mensagem para atualizar o status do pagamento no MongoDB.
```
echo '{"idPagamento": 1234567, "novoStatus": "PROCESSADO_SUCESSO"}' | docker exec -i kafka_kraft kafka-console-producer.sh --bootstrap-server localhost:9092 --topic pagamento-resposta
```
5. **Mongodb**: rode esse comando para verificar o status persistido do pagamento que tem um determinado idPagamento:
```
docker exec -it pagamento_restapi_mongodb mongosh --quiet --eval 'const doc = db.getSiblingDB("pagamentos_db").pagamentos.findOne({idPagamento: 1234567});if (doc) {printjson({idPagamento: doc.idPagamento,status: doc.status});} else {print("Nenhum documento encontrado");}'
``` 
### **Testes Unitários**
- Para executar os testes unitários do back-end, use o Gradle na pasta raiz do back-end:
   ```
     ./gradlew test 
   ```
- Para executar os testes unitários do front-end, use o Angular CLI na pasta raiz do front-end:
   ``` 
     npm test 
   ```

### imagens do backend e frontend - dockerhub:
- https://hub.docker.com/repository/docker/dtn84docker/pagamento-webapp-image/general
- https://hub.docker.com/repository/docker/dtn84docker/pagamento-restapi-image/general
