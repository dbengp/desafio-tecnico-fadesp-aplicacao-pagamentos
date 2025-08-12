import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule, NgClass, CurrencyPipe, DecimalPipe } from '@angular/common';
import { PagamentoService } from '../../services/pagamento.service';
import { Pagamento } from '../../models/pagamento.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PagamentoStatus } from '../../models/pagamento-status.enum';
import { ToastService } from '../../services/toast.service';
import { PagamentoFormComponent } from '../pagamento-form/pagamento-form.component';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pagamento-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgClass, DecimalPipe, PagamentoFormComponent],
  templateUrl: './pagamento-lista.component.html',
})

export class PagamentoListaComponent implements OnInit {

  private destroy$ = new Subject<void>();

  @Output() novoPagamentoEvent = new EventEmitter<void>();

  @Output() toastEvent = new EventEmitter<{ message: string, type: 'success' | 'error' }>();

  showPagamentoModal = false;

  pagamentos: Pagamento[] = [];
  filtroForm!: FormGroup;
  PagamentoStatus = PagamentoStatus;

  currentPage: number = 1;
  pageSize: number = 10; 
  totalItems: number = 0;
  totalPages: number = 0;
  pageSizes: number[] = [10, 20, 50]; 

  private allFilteredPagamentos: Pagamento[] = []; 

  constructor(private fb: FormBuilder, private pagamentoService: PagamentoService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.filtroForm = this.fb.group({
      busca: [''],
      status: ['Todos'],
      pageSize: [this.pageSize]
    });

    this.loadPagamentos();

    this.filtroForm.valueChanges.pipe(
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadPagamentos();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private mapStatusToEnum(statusString: string): PagamentoStatus {
    switch(statusString) {
      case 'PENDENTE_PROCESSAMENTO':
        return PagamentoStatus.PENDENTE_PROCESSAMENTO;
      case 'PROCESSADO_SUCESSO':
        return PagamentoStatus.PROCESSADO_SUCESSO;
      case 'PROCESSADO_FALHA':
        return PagamentoStatus.PROCESSADO_FALHA;
      default:
        return PagamentoStatus.PENDENTE_PROCESSAMENTO;
    }
  }


  loadPagamentos(): void {
    const formValue = this.filtroForm.value;
    const filtros: any = {};

    if (formValue.busca) {
      const busca = formValue.busca.trim();
      const apenasDigitos = busca.replace(/\D/g, '');

      if (apenasDigitos.length === 11 || apenasDigitos.length === 14) {
        filtros.cpfCnpj = apenasDigitos; 
      }
      
      else if (/^\d+$/.test(busca)) {
        filtros.idPagamento = parseInt(busca, 10);
      }
      
      else {
        
        const digitosCorrigidos = busca.replace(/\D/g, '');
        if (digitosCorrigidos.length === 11 || digitosCorrigidos.length === 14) {
          filtros.cpfCnpj = digitosCorrigidos;
        } else {
          this.toastService.show('Formato inválido: Use 11 dígitos para CPF ou 14 para CNPJ', 'error');
          return;
        }
      }
    }

    if (formValue.status && formValue.status !== 'Todos') {
      filtros.status = formValue.status;
    }

    this.pagamentoService.getPagamentos(filtros).subscribe({
      next: (data: Pagamento[]) => {
      
        this.allFilteredPagamentos = data.filter(p => p.ativo)
          .map(pagamento => ({
            ...pagamento,
            status: this.mapStatusToEnum(pagamento.status as unknown as string)
          }));
        
    
        this.totalItems = this.allFilteredPagamentos.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        
        this.applyPagination();
      },
      error: err => {
        this.toastService.show('Erro ao carregar pagamentos', 'error');
        console.error('Erro:', err);
      }
    });
  }

  
  private applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagamentos = this.allFilteredPagamentos.slice(startIndex, endIndex);
  }

  openNovoPagamentoModal(): void {
    this.showPagamentoModal = true;
  }

  fecharPagamentoModal(): void {
    this.showPagamentoModal = false;
  }

  onPagamentoCriado(): void {
    this.loadPagamentos();
    this.fecharPagamentoModal();
  }

  inativarPagamento(id: string | undefined): void {

    if (!id) {
      this.toastService.show('ID do pagamento inválido.', 'error');
      return;
    }

    this.pagamentoService.inativarPagamento(id).subscribe({
      next: () => {
        this.toastService.show('Pagamento inativado com sucesso!', 'success');
        this.loadPagamentos();
      },
      error: err => {
        this.toastService.show('Não foi possível inativar o pagamento. Verifique se o status é "Pendente Processamento".', 'error');
        console.error('Erro ao inativar pagamento:', err);
      }
    });
  }

  processarPagamento(idPagamento: number, status: PagamentoStatus): void {
    let novoStatus: PagamentoStatus = status;
    
    this.pagamentoService.processarPagamento(idPagamento, novoStatus).subscribe({
      next: (text) => {
        this.loadPagamentos();
        this.toastService.show('status do pagamento alterado com sucesso!', 'success');
      },
      error: err => {
        this.loadPagamentos();
        this.toastService.show('Não foi possível processar o pagamento.', 'error');
        console.error('Erro ao processar pagamento:', err);
      }
    });
  }


  //---- Todos os Métodos necessários para Paginação
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  //-- Fim dos Métodos necessários para Paginação: oh coisinha chata!

  getMetodoPagamento(metodo: string): string {
    switch (metodo) {
      case 'PIX': return 'PIX';
      case 'BOLETO': return 'Boleto';
      case 'CARTAO_CREDITO': return 'Cartão de Crédito';
      case 'CARTAO_DEBITO': return 'Cartão de Débito';
      default: return metodo;
    }
  }

  getStatusText(status: PagamentoStatus): string {
    switch (status) {
      case PagamentoStatus.PENDENTE_PROCESSAMENTO: return 'Pendente Processamento';
      case PagamentoStatus.PROCESSADO_SUCESSO: return 'Processado com Sucesso';
      case PagamentoStatus.PROCESSADO_FALHA: return 'Processado com Falha';
    }
  }
  
  getStatusClasses(status: PagamentoStatus): { [key: string]: boolean } { 
    return {
      'bg-yellow-100 text-yellow-800': status === PagamentoStatus.PENDENTE_PROCESSAMENTO,
      'bg-green-100 text-green-800': status === PagamentoStatus.PROCESSADO_SUCESSO,
      'bg-red-100 text-red-800': status === PagamentoStatus.PROCESSADO_FALHA
    };
  }
}
