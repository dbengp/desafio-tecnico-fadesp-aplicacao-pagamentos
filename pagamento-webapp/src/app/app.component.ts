import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagamentoListaComponent } from './components/pagamento-lista/pagamento-lista.component';
import { PagamentoFormComponent } from './components/pagamento-form/pagamento-form.component';
import { ToastComponent } from './components/toast/toast.component';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PagamentoListaComponent, PagamentoFormComponent, ToastComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  showFormModal = false;

  @ViewChild(PagamentoListaComponent) pagamentoListaComponent!: PagamentoListaComponent;

  constructor(private toastService: ToastService) {}

  openNovoPagamentoModal(): void {
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  onPagamentoCriado(): void {
    this.pagamentoListaComponent.loadPagamentos();
    this.toastService.show('Pagamento criado com sucesso!', 'success');
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastService.show(message, type);
  }
}