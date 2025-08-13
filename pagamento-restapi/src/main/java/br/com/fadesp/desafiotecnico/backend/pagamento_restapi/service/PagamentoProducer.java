package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.service;

import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.PagamentoStatusAtualizacao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PagamentoProducer {

    private final KafkaTemplate<String, PagamentoStatusAtualizacao> kafkaTemplate;

    @Value("${app.kafka.topic-request}")
    private String topicName;

    public PagamentoProducer(KafkaTemplate<String, PagamentoStatusAtualizacao> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void enviarMensagem(PagamentoStatusAtualizacao atualizacao) {
        log.info("Enviando mensagem para o tópico '{}': {}", topicName, atualizacao);
        kafkaTemplate.send(topicName, atualizacao);
    }
}
