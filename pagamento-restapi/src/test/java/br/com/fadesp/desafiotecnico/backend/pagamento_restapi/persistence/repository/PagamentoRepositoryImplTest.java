package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.repository;

import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.StatusPagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.entity.Pagamento;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.verify;


@ExtendWith(MockitoExtension.class)
@DisplayName("Testes para PagamentoRepositoryImpl")
class PagamentoRepositoryImplTest {

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private PagamentoRepositoryImpl pagamentoRepository;

    @Test
    @DisplayName("Deve construir query com filtro por ID do Pagamento e status")
    void testFindWithFilters_ComIdEStatus() {
        Long idPagamento = 1L;
        StatusPagamento status = StatusPagamento.PENDENTE_PROCESSAMENTO;

        pagamentoRepository.findWithFilters(idPagamento, null, status);

        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).find(queryCaptor.capture(), eq(Pagamento.class));

        Query capturedQuery = queryCaptor.getValue();
        assertNotNull(capturedQuery);

        assertTrue(capturedQuery.getQueryObject().containsKey("ativo"));
        assertTrue(capturedQuery.getQueryObject().getBoolean("ativo"));

        assertTrue(capturedQuery.getQueryObject().containsKey("$or"));

        assertTrue(capturedQuery.getQueryObject().containsKey("status"));
        assertEquals(status, capturedQuery.getQueryObject().get("status"));
    }

    @Test
    @DisplayName("Deve construir query com filtro por CPF/CNPJ e status")
    void testFindWithFilters_ComCpfCnpjEStatus() {
        String cpfCnpj = "12345678901";
        StatusPagamento status = StatusPagamento.PENDENTE_PROCESSAMENTO;

        pagamentoRepository.findWithFilters(null, cpfCnpj, status);

        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).find(queryCaptor.capture(), eq(Pagamento.class));

        Query capturedQuery = queryCaptor.getValue();
        assertNotNull(capturedQuery);

        assertTrue(capturedQuery.getQueryObject().containsKey("ativo"));
        assertTrue(capturedQuery.getQueryObject().getBoolean("ativo"));

        assertTrue(capturedQuery.getQueryObject().containsKey("$or"));

        assertTrue(capturedQuery.getQueryObject().containsKey("status"));
        assertEquals(status, capturedQuery.getQueryObject().get("status"));
    }

    @Test
    @DisplayName("Deve construir query com filtro por todos os parâmetros")
    void testFindWithFilters_ComTodosFiltros() {
        Long idPagamento = 1L;
        String cpfCnpj = "12345678901";
        StatusPagamento status = StatusPagamento.PENDENTE_PROCESSAMENTO;

        pagamentoRepository.findWithFilters(idPagamento, cpfCnpj, status);

        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).find(queryCaptor.capture(), eq(Pagamento.class));

        Query capturedQuery = queryCaptor.getValue();
        assertNotNull(capturedQuery);

        assertTrue(capturedQuery.getQueryObject().containsKey("ativo"));
        assertTrue(capturedQuery.getQueryObject().getBoolean("ativo"));

        assertTrue(capturedQuery.getQueryObject().containsKey("$or"));

        assertTrue(capturedQuery.getQueryObject().containsKey("status"));
        assertEquals(status, capturedQuery.getQueryObject().get("status"));
    }
}