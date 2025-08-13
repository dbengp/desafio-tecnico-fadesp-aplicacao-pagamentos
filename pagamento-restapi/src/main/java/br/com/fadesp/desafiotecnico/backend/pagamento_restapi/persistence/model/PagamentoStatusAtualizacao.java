package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class PagamentoStatusAtualizacao {

    @NotNull(message = "O idPagamento é obrigatório")
    private Long idPagamento;

    @NotNull(message = "O novoStatus é obrigatório")
    private StatusPagamento novoStatus;

}