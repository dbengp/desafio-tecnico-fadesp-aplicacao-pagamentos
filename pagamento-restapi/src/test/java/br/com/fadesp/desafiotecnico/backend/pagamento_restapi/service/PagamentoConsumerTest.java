package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.service;

import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.PagamentoStatusAtualizacao;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.StatusPagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.entity.Pagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.repository.PagamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes para PagamentoConsumer")
class PagamentoConsumerTest {

    @Mock
    private PagamentoRepository pagamentoRepository;

    @InjectMocks
    private PagamentoConsumer pagamentoConsumer;

    private Pagamento pagamento;
    private PagamentoStatusAtualizacao atualizacao;

    @BeforeEach
    void setUp() {
        pagamento = new Pagamento();
        pagamento.setId("689a072281ee3387cdf579b3");
        pagamento.setIdPagamento(1L);
        pagamento.setValor(new BigDecimal("100.00"));
        pagamento.setStatus(StatusPagamento.PENDENTE_PROCESSAMENTO);
        pagamento.setAtivo(true);

        atualizacao = new PagamentoStatusAtualizacao();
        atualizacao.setIdPagamento(1L);
    }

    @Test
    @DisplayName("Deve atualizar o status do pagamento para PROCESSADO_SUCESSO")
    void testConsumirMensagem_AtualizacaoSucesso_Sucesso() {
        atualizacao.setNovoStatus(StatusPagamento.PROCESSADO_SUCESSO);
        when(pagamentoRepository.findByIdPagamentoAndAtivoIsTrue(1L)).thenReturn(Optional.of(pagamento));

        pagamentoConsumer.consumirMensagem(atualizacao);

        ArgumentCaptor<Pagamento> pagamentoCaptor = ArgumentCaptor.forClass(Pagamento.class);
        verify(pagamentoRepository, times(1)).save(pagamentoCaptor.capture());
        assertEquals(StatusPagamento.PROCESSADO_SUCESSO, pagamentoCaptor.getValue().getStatus());
    }

    @Test
    @DisplayName("Deve atualizar o status do pagamento para PROCESSADO_FALHA")
    void testConsumirMensagem_AtualizacaoFalha_Sucesso() {
        atualizacao.setNovoStatus(StatusPagamento.PROCESSADO_FALHA);
        when(pagamentoRepository.findByIdPagamentoAndAtivoIsTrue(1L)).thenReturn(Optional.of(pagamento));

        pagamentoConsumer.consumirMensagem(atualizacao);

        ArgumentCaptor<Pagamento> pagamentoCaptor = ArgumentCaptor.forClass(Pagamento.class);
        verify(pagamentoRepository, times(1)).save(pagamentoCaptor.capture());
        assertEquals(StatusPagamento.PROCESSADO_FALHA, pagamentoCaptor.getValue().getStatus());
    }

    @Test
    @DisplayName("Não deve atualizar o status se o pagamento não for encontrado")
    void testConsumirMensagem_PagamentoNaoEncontrado_NaoAtualiza() {
        atualizacao.setNovoStatus(StatusPagamento.PROCESSADO_SUCESSO);
        when(pagamentoRepository.findByIdPagamentoAndAtivoIsTrue(1L)).thenReturn(Optional.empty());

        pagamentoConsumer.consumirMensagem(atualizacao);

        verify(pagamentoRepository, never()).save(any(Pagamento.class));
    }

    @Test
    @DisplayName("Não deve atualizar o status se a regra de negócio for violada (status já PROCESSADO_SUCESSO)")
    void testConsumirMensagem_ViolacaoRegra_NaoAtualiza() {
        pagamento.setStatus(StatusPagamento.PROCESSADO_SUCESSO);
        atualizacao.setNovoStatus(StatusPagamento.PROCESSADO_FALHA);
        when(pagamentoRepository.findByIdPagamentoAndAtivoIsTrue(1L)).thenReturn(Optional.of(pagamento));

        pagamentoConsumer.consumirMensagem(atualizacao);

        verify(pagamentoRepository, never()).save(any(Pagamento.class));
    }

    @Test
    @DisplayName("Deve permitir transição de PROCESSADO_FALHA para PENDENTE_PROCESSAMENTO")
    void testConsumirMensagem_TransicaoDeFalhaParaPendente_Sucesso() {
        pagamento.setStatus(StatusPagamento.PROCESSADO_FALHA);
        atualizacao.setNovoStatus(StatusPagamento.PENDENTE_PROCESSAMENTO);
        when(pagamentoRepository.findByIdPagamentoAndAtivoIsTrue(1L)).thenReturn(Optional.of(pagamento));

        pagamentoConsumer.consumirMensagem(atualizacao);

        ArgumentCaptor<Pagamento> pagamentoCaptor = ArgumentCaptor.forClass(Pagamento.class);
        verify(pagamentoRepository, times(1)).save(pagamentoCaptor.capture());
        assertEquals(StatusPagamento.PENDENTE_PROCESSAMENTO, pagamentoCaptor.getValue().getStatus());
    }
}