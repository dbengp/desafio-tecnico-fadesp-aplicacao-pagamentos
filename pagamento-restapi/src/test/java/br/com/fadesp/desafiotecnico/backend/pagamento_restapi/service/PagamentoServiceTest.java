package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.service;

import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.PagamentoStatusAtualizacao;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.StatusPagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.entity.Pagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.repository.PagamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes para PagamentoService")
class PagamentoServiceTest {

    @Mock
    private PagamentoRepository pagamentoRepository;

    @Mock
    private PagamentoProducer pagamentoProducer;

    @InjectMocks
    private PagamentoService pagamentoService;

    private Pagamento pagamento;

    @BeforeEach
    void setUp() {
        pagamento = new Pagamento();
        pagamento.setId("689a072281ee3387cdf579b3");
        pagamento.setIdPagamento(1L);
        pagamento.setValor(new BigDecimal("100.00"));
        pagamento.setStatus(StatusPagamento.PENDENTE_PROCESSAMENTO);
        pagamento.setAtivo(true);
    }

    @Test
    @DisplayName("Deve criar um novo pagamento com status PENDENTE_PROCESSAMENTO")
    void testCriarPagamento_Sucesso() {
        when(pagamentoRepository.save(any(Pagamento.class))).thenReturn(pagamento);

        Pagamento novoPagamento = pagamentoService.criarPagamento(pagamento);

        assertEquals(StatusPagamento.PENDENTE_PROCESSAMENTO, novoPagamento.getStatus());
        verify(pagamentoRepository, times(1)).save(pagamento);
    }

    @Test
    @DisplayName("Deve listar todos os pagamentos ativos quando nenhum filtro for fornecido")
    void testListarPagamentos_SemFiltros_Sucesso() {
        when(pagamentoRepository.findByAtivoIsTrue()).thenReturn(Collections.singletonList(pagamento));

        List<Pagamento> pagamentos = pagamentoService.listarPagamentos(null, "", null);

        assertFalse(pagamentos.isEmpty());
        verify(pagamentoRepository, times(1)).findByAtivoIsTrue();
        verify(pagamentoRepository, never()).findWithFilters(any(), any(), any());
    }

    @Test
    @DisplayName("Deve listar pagamentos com filtros")
    void testListarPagamentos_ComFiltros_Sucesso() {
        when(pagamentoRepository.findWithFilters(1L, "12345678901", StatusPagamento.PENDENTE_PROCESSAMENTO))
                .thenReturn(Collections.singletonList(pagamento));

        List<Pagamento> pagamentos = pagamentoService.listarPagamentos(1L, "12345678901", StatusPagamento.PENDENTE_PROCESSAMENTO);

        assertFalse(pagamentos.isEmpty());
        verify(pagamentoRepository, times(1)).findWithFilters(1L, "12345678901", StatusPagamento.PENDENTE_PROCESSAMENTO);
        verify(pagamentoRepository, never()).findByAtivoIsTrue();
    }

    @Test
    @DisplayName("Deve inativar um pagamento com status PENDENTE_PROCESSAMENTO")
    void testInativarPagamento_StatusPendente_Sucesso() {
        when(pagamentoRepository.findById(pagamento.getId())).thenReturn(Optional.of(pagamento));

        boolean resultado = pagamentoService.inativarPagamento(pagamento.getId());

        assertTrue(resultado);
        assertFalse(pagamento.isAtivo());
        verify(pagamentoRepository, times(1)).findById(pagamento.getId());
        verify(pagamentoRepository, times(1)).save(pagamento);
    }

    @Test
    @DisplayName("Não deve inativar um pagamento com status diferente de PENDENTE_PROCESSAMENTO")
    void testInativarPagamento_StatusNaoPendente_Falha() {
        pagamento.setStatus(StatusPagamento.PROCESSADO_SUCESSO);
        when(pagamentoRepository.findById(pagamento.getId())).thenReturn(Optional.of(pagamento));

        boolean resultado = pagamentoService.inativarPagamento(pagamento.getId());

        assertFalse(resultado);
        verify(pagamentoRepository, times(1)).findById(pagamento.getId());
        verify(pagamentoRepository, never()).save(any(Pagamento.class));
    }

    @Test
    @DisplayName("Não deve inativar um pagamento que não existe")
    void testInativarPagamento_NaoEncontrado_Falha() {
        when(pagamentoRepository.findById("id_nao_existe")).thenReturn(Optional.empty());

        boolean resultado = pagamentoService.inativarPagamento("id_nao_existe");

        assertFalse(resultado);
        verify(pagamentoRepository, times(1)).findById("id_nao_existe");
        verify(pagamentoRepository, never()).save(any(Pagamento.class));
    }

    @Test
    @DisplayName("Deve enviar mensagem para o Kafka quando o status não for PROCESSADO_SUCESSO")
    void testProcessarAtualizacaoStatus_Sucesso() {
        PagamentoStatusAtualizacao atualizacao = new PagamentoStatusAtualizacao();
        atualizacao.setIdPagamento(1L);
        atualizacao.setNovoStatus(StatusPagamento.PROCESSADO_FALHA);

        when(pagamentoRepository.findByIdPagamentoAndAtivoIsTrue(1L)).thenReturn(Optional.of(pagamento));

        boolean resultado = pagamentoService.processarAtualizacaoStatus(atualizacao);

        assertTrue(resultado);
        verify(pagamentoProducer, times(1)).enviarMensagem(atualizacao);
    }

    @Test
    @DisplayName("Não deve enviar mensagem quando o pagamento não for encontrado")
    void testProcessarAtualizacaoStatus_NaoEncontrado_Falha() {
        PagamentoStatusAtualizacao atualizacao = new PagamentoStatusAtualizacao();
        atualizacao.setIdPagamento(99L);
        when(pagamentoRepository.findByIdPagamentoAndAtivoIsTrue(99L)).thenReturn(Optional.empty());

        boolean resultado = pagamentoService.processarAtualizacaoStatus(atualizacao);

        assertFalse(resultado);
        verify(pagamentoProducer, never()).enviarMensagem(any());
    }
}