package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.repository;

import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.StatusPagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.entity.Pagamento;

import java.util.List;


public interface PagamentoRepositoryCustom {
    List<Pagamento> findWithFilters(Long idPagamento, String cpfCnpj, StatusPagamento status);
}
