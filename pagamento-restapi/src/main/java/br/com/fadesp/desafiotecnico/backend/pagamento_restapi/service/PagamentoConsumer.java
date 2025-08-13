package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.service;

import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.PagamentoStatusAtualizacao;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.StatusPagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.entity.Pagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.repository.PagamentoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@EnableKafka
public class PagamentoConsumer {

    private final PagamentoRepository pagamentoRepository;

    public PagamentoConsumer(PagamentoRepository pagamentoRepository) {
        this.pagamentoRepository = pagamentoRepository;
    }

    @KafkaListener(topics = "${app.kafka.topic-response}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumirMensagem(PagamentoStatusAtualizacao atualizacao) {
        log.info("Mensagem recebida do Kafka: {}", atualizacao);

        Optional<Pagamento> pagamentoOptional = pagamentoRepository.findByIdPagamentoAndAtivoIsTrue(atualizacao.getIdPagamento());

        if (pagamentoOptional.isPresent()) {
            Pagamento pagamento = pagamentoOptional.get();

            if (podeAtualizarStatus(pagamento.getStatus(), atualizacao.getNovoStatus())) {
                pagamento.setStatus(atualizacao.getNovoStatus());
                pagamentoRepository.save(pagamento);
                log.info("Status do pagamento {} atualizado com sucesso para {}", pagamento.getIdPagamento(), atualizacao.getNovoStatus());
            } else {
                log.warn("Não foi possível atualizar o status do pagamento {} de {} para {}. Regra de negócio violada.",
                        pagamento.getIdPagamento(), pagamento.getStatus(), atualizacao.getNovoStatus());
            }
        } else {
            log.warn("Pagamento com idPagamento {} não encontrado para atualização.", atualizacao.getIdPagamento());
        }
    }

    private boolean podeAtualizarStatus(StatusPagamento statusAtual, StatusPagamento novoStatus) {

        if (statusAtual.equals(StatusPagamento.PROCESSADO_SUCESSO)) {
            return false;
        }
        if (statusAtual.equals(StatusPagamento.PROCESSADO_FALHA) && novoStatus.equals(StatusPagamento.PENDENTE_PROCESSAMENTO)) {
            return true;
        }
        if (statusAtual.equals(StatusPagamento.PENDENTE_PROCESSAMENTO)) {
            return novoStatus.equals(StatusPagamento.PROCESSADO_SUCESSO) || novoStatus.equals(StatusPagamento.PROCESSADO_FALHA);
        }
        return false;
    }
}
