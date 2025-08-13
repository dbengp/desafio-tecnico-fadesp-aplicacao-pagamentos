package br.com.fadesp.desafiotecnico.backend.pagamento_restapi.controller;

import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.PagamentoStatusAtualizacao;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.StatusPagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.persistence.model.entity.Pagamento;
import br.com.fadesp.desafiotecnico.backend.pagamento_restapi.service.PagamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pagamentos")
@Tag(name = "Pagamentos", description = "Endpoints para gerenciamento de pagamentos")
public class PagamentoController {

    private final PagamentoService pagamentoService;

    public PagamentoController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }


    @PostMapping
    @Operation(summary = "Criar um novo pagamento", description = "Registra um novo pagamento no sistema. O status inicial é definido automaticamente para 'PENDENTE_PROCESSAMENTO'. Caso a método de pagamento não seja cartão, o valor de 'numeroCartao' deve ser null")
    @ApiResponse(responseCode = "201", description = "Pagamento criado com sucesso.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = Pagamento.class)))
    @ApiResponse(responseCode = "400", description = "Dados da requisição inválidos.")
    public ResponseEntity<Pagamento> criarPagamento(@RequestBody @Valid Pagamento pagamento) {
        Pagamento novoPagamento = pagamentoService.criarPagamento(pagamento);
        return new ResponseEntity<>(novoPagamento, HttpStatus.CREATED);
    }


    @GetMapping("/lista")
    @Operation(summary = "Listar pagamentos", description = "Busca pagamentos com base em filtros opcionais. Se nenhum filtro for fornecido, todos os pagamentos ativos serão retornados.")
    @ApiResponse(responseCode = "200", description = "Lista de pagamentos obtida com sucesso.",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = Pagamento.class)))
    public ResponseEntity<List<Pagamento>> listarPagamentos(
            @Parameter(description = "ID do pagamento para busca.", example = "1") @RequestParam(required = false) Long idPagamento,
            @Parameter(description = "CPF ou CNPJ do pagador.", example = "12345678901") @RequestParam(required = false) String cpfCnpj,
            @Parameter(description = "Status do pagamento para busca.", example = "PENDENTE_PROCESSAMENTO") @RequestParam(required = false) StatusPagamento status) {
        List<Pagamento> pagamentos = pagamentoService.listarPagamentos(idPagamento, cpfCnpj, status);
        return new ResponseEntity<>(pagamentos, HttpStatus.OK);
    }


    @PutMapping("/status")
    @Operation(summary = "Atualizar status de um pagamento", description = "Processa a atualização de status de um pagamento. A atualização só é possível se o pagamento não estiver com o status 'PROCESSADO_SUCESSO'. A operação é assíncrona, enviando uma mensagem para o Kafka.")
    @ApiResponse(responseCode = "200", description = "Mensagem de atualização de status enviada com sucesso para o Kafka.")
    @ApiResponse(responseCode = "400", description = "Não foi possível atualizar o status: quebra da regra de negócio (pagamento já processado ou não encontrado).")
    @ApiResponse(responseCode = "404", description = "Pagamento com o ID fornecido não encontrado.")
    public ResponseEntity<String> atualizarStatus(@RequestBody @Valid PagamentoStatusAtualizacao atualizacao) {
        if (pagamentoService.processarAtualizacaoStatus(atualizacao)){
			return new ResponseEntity<>("Mensagem de atualização de status enviada para o Kafka.", HttpStatus.OK);
		} else {
			return new ResponseEntity<>("Não foi possível atualizar o status: quebra da regra de negócio.", HttpStatus.BAD_REQUEST);
		}
    }


    @DeleteMapping("/{id}")
    @Operation(summary = "Inativar um pagamento", description = "Inativa um pagamento, impedindo futuras atualizações. A inativação só é permitida se o pagamento estiver com o status 'PENDENTE_PROCESSAMENTO'.")
    @ApiResponse(responseCode = "200", description = "Pagamento inativado com sucesso.")
    @ApiResponse(responseCode = "400", description = "Não foi possível inativar o pagamento. A inativação só é permitida para pagamentos com status 'PENDENTE_PROCESSAMENTO'.")
    @ApiResponse(responseCode = "404", description = "Pagamento com o ID fornecido não encontrado.")
    public ResponseEntity<String> inativarPagamento(@PathVariable @Parameter(description = "ID do pagamento a ser inativado.", example = "689a072281ee3387cdf579b3") String id) {
        if (pagamentoService.inativarPagamento(id)) {
            return new ResponseEntity<>("Pagamento inativado com sucesso.", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Não foi possível inativar o pagamento.", HttpStatus.BAD_REQUEST);
        }
    }
}
