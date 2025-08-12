import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagamentoService } from '../../services/pagamento.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NovoPagamento, Pagamento } from '../../models/pagamento.model'; 

@Component({
  selector: 'app-pagamento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './pagamento-form.component.html',
})

export class PagamentoFormComponent implements OnInit {
  @Input() showModal = false;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() pagamentoCriado = new EventEmitter<void>();

  pagamentoForm!: FormGroup;
  isCartao = false;

  constructor(private fb: FormBuilder, private pagamentoService: PagamentoService) { }

  ngOnInit(): void {
    this.pagamentoForm = this.fb.group({
      cpfCnpj: ['', Validators.required],
      metodoPagamento: ['', Validators.required],
      numeroCartao: [''],
      valor: [null, [Validators.required, Validators.min(0.01)]],
    });

    
    this.pagamentoForm.get('metodoPagamento')?.valueChanges.subscribe(metodo => {
      
      this.isCartao = metodo === 'CARTAO_CREDITO' || metodo === 'CARTAO_DEBITO';
      if (this.isCartao) {
        this.pagamentoForm.get('numeroCartao')?.setValidators(Validators.required);
      } else {
        this.pagamentoForm.get('numeroCartao')?.clearValidators();
      }
      this.pagamentoForm.get('numeroCartao')?.updateValueAndValidity();
    });
  }

  fecharModal(): void {
    this.modalClosed.emit();
  }

  formatarCpfCnpj(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
    } else if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    }
    this.pagamentoForm.get('cpfCnpj')?.setValue(value, { emitEvent: false });
  }

  salvarPagamento(): void {
    if (this.pagamentoForm.valid) {
      const formValue = this.pagamentoForm.value;
      
      const numeroCartao = this.isCartao ? formValue.numeroCartao?.replace(/\D/g, '') : undefined;

      const payload = {
        cpfCnpj: formValue.cpfCnpj.replace(/\D/g, ''),
        metodoPagamento: formValue.metodoPagamento as 'PIX' | 'BOLETO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO',
        valor: formValue.valor.toString(),
        idPagamento: Math.floor(100000000 + Math.random() * 900000000),
        status: 'PENDENTE_PROCESSAMENTO' as const,
        ativo: true,
        ...(numeroCartao && { numeroCartao })
      };

      console.log('Payload final:', payload);

      this.pagamentoService.criarPagamento(payload).subscribe({
        next: () => {
          this.pagamentoCriado.emit();
          this.fecharModal();
          this.pagamentoForm.reset();
        },
        error: (err) => {
          console.error('Erro detalhado:', err);
          alert(`Falha ao criar pagamento: ${err.error?.message || err.message}`);
        }
      });
    }
  }
}
