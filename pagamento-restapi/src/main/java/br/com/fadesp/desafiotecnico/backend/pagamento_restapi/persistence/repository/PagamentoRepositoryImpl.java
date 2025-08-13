package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.repository;

import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.StatusPagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.entity.Pagamento;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.ArrayList;
import java.util.List;
public class PagamentoRepositoryImpl implements PagamentoRepositoryCustom {

    private final MongoTemplate mongoTemplate;

    public PagamentoRepositoryImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public List<Pagamento> findWithFilters(Long idPagamento, String cpfCnpj, StatusPagamento status) {
        Query query = new Query();
        query.addCriteria(Criteria.where("ativo").is(true));

        List<Criteria> orCriterias = new ArrayList<>();
        boolean hasOrCriteria = false;

        if (idPagamento != null) {
            orCriterias.add(Criteria.where("idPagamento").is(idPagamento));
            hasOrCriteria = true;
        }

        if (cpfCnpj != null && !cpfCnpj.isEmpty()) {
            orCriterias.add(Criteria.where("cpfCnpj").regex(cpfCnpj, "i"));
            hasOrCriteria = true;
        }

        if (hasOrCriteria) {
            Criteria orCondition = new Criteria().orOperator(orCriterias.toArray(new Criteria[0]));
            query.addCriteria(orCondition);
        }

        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }

        return mongoTemplate.find(query, Pagamento.class);
    }
}
