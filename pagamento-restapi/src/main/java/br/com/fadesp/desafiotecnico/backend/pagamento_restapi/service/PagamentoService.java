package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.service;

import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.PagamentoStatusAtualizacao;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.StatusPagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.entity.Pagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.repository.PagamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final PagamentoProducer pagamentoProducer;

    public PagamentoService(PagamentoRepository pagamentoRepository, PagamentoProducer pagamentoProducer) {
        this.pagamentoRepository = pagamentoRepository;
        this.pagamentoProducer = pagamentoProducer;
    }

    @Transactional
    public Pagamento criarPagamento(Pagamento pagamento) {
        pagamento.setStatus(StatusPagamento.PENDENTE_PROCESSAMENTO);
        return pagamentoRepository.save(pagamento);
    }

    @Transactional(readOnly = true)
    public List<Pagamento> listarPagamentos(Long idPagamento, String cpfCnpj, StatusPagamento status) {

        if (idPagamento == null && (cpfCnpj == null || cpfCnpj.isEmpty()) && status == null) {
            return pagamentoRepository.findByAtivoIsTrue();
        }

        return pagamentoRepository.findWithFilters(idPagamento, cpfCnpj, status);
    }

    @Transactional
    public boolean inativarPagamento(String id) {
        Optional<Pagamento> optionalPagamento = pagamentoRepository.findById(id);
        if (optionalPagamento.isPresent()) {
            Pagamento pagamento = optionalPagamento.get();
            if (pagamento.getStatus() == StatusPagamento.PENDENTE_PROCESSAMENTO) {
                pagamento.setAtivo(false);
                pagamentoRepository.save(pagamento);
                return true;
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public boolean processarAtualizacaoStatus(PagamentoStatusAtualizacao atualizacao) {
		
		Optional<Pagamento> pagamentoOptional = pagamentoRepository.findByIdPagamentoAndAtivoIsTrue(atualizacao.getIdPagamento());
		
		if (pagamentoOptional.isEmpty() || pagamentoOptional.get().getStatus().equals(StatusPagamento.PROCESSADO_SUCESSO)){
			return false;
		}
        else{
			pagamentoProducer.enviarMensagem(atualizacao);
			return true;
        }
    }
}

