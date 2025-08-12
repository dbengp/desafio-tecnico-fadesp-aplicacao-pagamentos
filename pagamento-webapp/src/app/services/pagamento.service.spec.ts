import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PagamentoService } from './pagamento.service';
import { Pagamento } from '../models/pagamento.model';
import { HttpStatusCode } from '@angular/common/http';
import { throwError } from 'rxjs';
import { MetodoPagamento } from '../models/pagamento-metodo.enum';
import { PagamentoStatus } from '../models/pagamento-status.enum';

function createMockPagamento(overrides: Partial<Pagamento> = {}): Pagamento {
  return {
    id: '1',
    idPagamento: 123,
    cpfCnpj: '12345678909',
    metodoPagamento: MetodoPagamento.PIX,
    valor: 100,
    status: PagamentoStatus.PENDENTE_PROCESSAMENTO,
    ativo: true,
    ...overrides
  };
}

describe('PagamentoService', () => {
  let service: PagamentoService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:8080/pagamentos';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PagamentoService]
    });

    service = TestBed.inject(PagamentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });


  describe('getPagamentos()', () => {
    it('deve retornar lista de pagamentos com filtros', () => {
      const mockPagamentos = [
        createMockPagamento({
          id: '1',
          metodoPagamento: MetodoPagamento.BOLETO,
          ativo: false
        })
      ];

      const filtro = { 
        idPagamento: 123, 
        cpfCnpj: '12345678909', 
        status: PagamentoStatus.PENDENTE_PROCESSAMENTO 
      };

      service.getPagamentos(filtro).subscribe(pagamentos => {
        expect(pagamentos.length).toBe(1);
        expect(pagamentos).toEqual(mockPagamentos);
      });

      const req = httpMock.expectOne(
        req => req.url === `${API_URL}/lista` &&
               req.params.get('idPagamento') === '123' &&
               req.params.get('cpfCnpj') === '12345678909' &&
               req.params.get('status') === PagamentoStatus.PENDENTE_PROCESSAMENTO
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPagamentos);
    });

    it('deve lidar com erro na requisição', () => {
      const filtro = {};
      service.getPagamentos(filtro).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.message).toContain('Erro ao carregar pagamentos');
        }
      });

      const req = httpMock.expectOne(`${API_URL}/lista`);
      req.error(new ProgressEvent('Erro de rede'), { status: 500 });
    });
  });

  describe('criarPagamento()', () => {
    it('deve criar pagamento com sucesso', () => {
      const payload = { 
        valor: 100, 
        metodoPagamento: MetodoPagamento.PIX,
        cpfCnpj: '12345678909'
      };
      
      const respostaMock = createMockPagamento(payload);

      service.criarPagamento(payload).subscribe(response => {
        expect(response).toEqual(respostaMock);
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(respostaMock);
    });

    it('deve propagar erro do servidor', () => {
      const payload = { 
        valor: 100,
        metodoPagamento: MetodoPagamento.PIX,
        cpfCnpj: '12345678909'
      };
      
      const erroMock = { status: 400, error: { message: 'Dados inválidos' } };

      service.criarPagamento(payload).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toBe('Dados inválidos');
        }
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(erroMock.error, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('processarPagamento()', () => {
    it('deve atualizar status com sucesso', () => {
      const idPagamento = 123;
      const novoStatus = PagamentoStatus.PROCESSADO_SUCESSO;
      const respostaMock = 'Status atualizado';

      service.processarPagamento(idPagamento, novoStatus).subscribe(response => {
        expect(response).toBe(respostaMock);
      });

      const req = httpMock.expectOne(`${API_URL}/status`);
      expect(req.request.method).toBe('PUT');
      req.flush(respostaMock);
    });

    it('deve tratar erro 400 (Bad Request) com corpo nulo', fakeAsync(() => {
      const idPagamento = 123;
      const novoStatus = PagamentoStatus.PROCESSADO_SUCESSO;

      service.processarPagamento(idPagamento, novoStatus).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.message).toContain('Http failure response for http://localhost:8080/pagamentos/status: 400 Bad Request');
        }
      });

     const req = httpMock.expectOne(`${API_URL}/status`);
        req.flush(null, {
          status: HttpStatusCode.BadRequest,
          statusText: 'Bad Request'
      });
      tick();
    }));
    
  });

  describe('inativarPagamento()', () => {
    it('deve inativar pagamento com sucesso', () => {
      const id = '1';
      const respostaMock = 'Pagamento inativado';

      service.inativarPagamento(id).subscribe(response => {
        expect(response).toBe(respostaMock);
      });

      const req = httpMock.expectOne(`${API_URL}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(respostaMock);
    });

    it('deve lidar com erro na inativação', () => {
      const id = '1';

      service.inativarPagamento(id).subscribe({
        next: () => fail('Deveria ter falhado'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${API_URL}/${id}`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});