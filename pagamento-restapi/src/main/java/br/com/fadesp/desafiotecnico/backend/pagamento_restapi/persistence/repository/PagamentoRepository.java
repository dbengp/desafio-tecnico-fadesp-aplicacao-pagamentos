package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.repository;


import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.entity.Pagamento;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagamentoRepository extends MongoRepository<Pagamento, String>, PagamentoRepositoryCustom {

    Optional<Pagamento> findByIdPagamentoAndAtivoIsTrue(Long idPagamento);

    List<Pagamento> findByAtivoIsTrue();
}
