import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpStatusCode } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Pagamento } from '../models/pagamento.model';
import { PagamentoStatus } from '../models/pagamento-status.enum';
import { timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PaginatedResponse {
  data: Pagamento[];
  totalCount: number;
}

export interface PagamentoStatusAtualizacao {
  idPagamento: number;
  novoStatus: PagamentoStatus;
}

@Injectable({
  providedIn: 'root'
})

export class PagamentoService {
  
  private apiUrl = environment.production ? '/api/pagamentos' : 'http://localhost:8080/pagamentos';

  constructor(private http: HttpClient) { }

  getPagamentos(filtro: any): Observable<Pagamento[]> {
    let params = new HttpParams();
    
    if (filtro.idPagamento && !isNaN(filtro.idPagamento)) {
      params = params.set('idPagamento', filtro.idPagamento);
    }

    if (filtro.cpfCnpj && filtro.cpfCnpj.trim() !== '') {
      params = params.set('cpfCnpj', filtro.cpfCnpj);
    }

    if (filtro.status && filtro.status !== 'Todos') {
      params = params.set('status', filtro.status);
    }

    return this.http.get<Pagamento[]>(`${this.apiUrl}/lista`, { params }).pipe(
      timeout(10000),
      catchError(error => {
        console.error('Erro na requisição de pagamentos:', error);
        return throwError(() => new Error('Erro ao carregar pagamentos'));
      })
    );
  }


  criarPagamento(pagamento: any): Observable<Pagamento> {
    return this.http.post<Pagamento>(this.apiUrl, pagamento).pipe(
      catchError(error => {
        console.error('Payload com erro:', pagamento);
        console.error('Resposta do erro:', error);
        return throwError(() => error);
      })
    );
  }

  
  processarPagamento(idPagamento: number, novoStatus: PagamentoStatus): Observable<string> {
    const statusData: PagamentoStatusAtualizacao = {
      idPagamento: idPagamento,
      novoStatus: novoStatus
    };

    return this.http.put(`${this.apiUrl}/status`, statusData, { 
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map(response => {
        if (response.status === HttpStatusCode.BadRequest) {
          throw new Error(response.body || 'Regra de negócio violada');
        }
        return response.body!;
      }),
      catchError(error => {
        const errorMsg = error.error?.message || error.message || 'Erro desconhecido';
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  inativarPagamento(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}