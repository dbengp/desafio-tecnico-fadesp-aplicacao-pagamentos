package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.entity;

import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.MetodoPagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.StatusPagamento;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "pagamentos")
public class Pagamento {

    @Id
    @Schema(hidden = true)
    private String id;

    @NotNull(message = "O ID do pagamento é obrigatório")
    @Min(value = 1, message = "O ID do pagamento deve ser um número positivo")
    private Long idPagamento;

    @NotBlank(message = "O CPF/CNPJ é obrigatório")
    @Size(min = 11, max = 14, message = "O CPF/CNPJ deve ter 11 ou 14 dígitos")
    @Pattern(regexp = "^\\d{11}$|^\\d{14}$", message = "O CPF/CNPJ deve conter apenas números e ter 11 ou 14 dígitos")
    private String cpfCnpj;

    @NotNull(message = "O método de pagamento é obrigatório")
    private MetodoPagamento metodoPagamento;

    @Size(min = 16, max = 16, message = "O número do cartão deve ter 16 dígitos")
    @Pattern(regexp = "^\\d*$", message = "O número do cartão deve conter apenas números")
    private String numeroCartao; 

    @NotNull(message = "O valor é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
    private BigDecimal valor;

    private StatusPagamento status;
    
    private boolean ativo = true; 
	
}