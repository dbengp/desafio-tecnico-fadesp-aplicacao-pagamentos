import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PagamentoFormComponent } from './pagamento-form.component';
import { PagamentoService } from '../../services/pagamento.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Pagamento } from '../../models/pagamento.model';
import { MetodoPagamento } from '../../models/pagamento-metodo.enum';
import { PagamentoStatus } from '../../models/pagamento-status.enum';

describe('PagamentoFormComponent', () => {
  let component: PagamentoFormComponent;
  let fixture: ComponentFixture<PagamentoFormComponent>;
  let pagamentoServiceSpy: jasmine.SpyObj<PagamentoService>;

  beforeEach(async () => {
    pagamentoServiceSpy = jasmine.createSpyObj('PagamentoService', ['criarPagamento']);

    spyOn(console, 'log').and.callThrough();

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        PagamentoFormComponent
      ],
      providers: [
        { provide: PagamentoService, useValue: pagamentoServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PagamentoFormComponent);
    component = fixture.componentInstance;
    component.showModal = true;
    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar o formulário com campos vazios', () => {
    expect(component.pagamentoForm.value).toEqual({
      cpfCnpj: '',
      metodoPagamento: '',
      numeroCartao: '',
      valor: null
    });
  });

  it('deve tornar numeroCartao obrigatório quando método for cartão', () => {
    component.pagamentoForm.get('metodoPagamento')?.setValue('CARTAO_CREDITO');
    expect(component.pagamentoForm.get('numeroCartao')?.validator).toBeTruthy();
    expect(component.isCartao).toBeTrue();
  });

  it('deve remover validação de numeroCartao quando método não for cartão', () => {
    component.pagamentoForm.get('metodoPagamento')?.setValue('PIX');
    expect(component.pagamentoForm.get('numeroCartao')?.validator).toBeNull();
    expect(component.isCartao).toBeFalse();
  });

  it('deve formatar CPF/CNPJ corretamente', () => {
    const eventCPF = { target: { value: '12345678901' } };
    component.formatarCpfCnpj(eventCPF);
    expect(component.pagamentoForm.get('cpfCnpj')?.value).toBe('123.456.789-01');

    const eventCNPJ = { target: { value: '12345678000199' } };
    component.formatarCpfCnpj(eventCNPJ);
    expect(component.pagamentoForm.get('cpfCnpj')?.value).toBe('12.345.678/0001-99');
  });

  it('deve emitir evento ao fechar modal', () => {
    spyOn(component.modalClosed, 'emit');
    component.fecharModal();
    expect(component.modalClosed.emit).toHaveBeenCalled();
  });

  it('deve enviar payload correto ao salvar formulário válido', fakeAsync(() => {
    
    const mockPagamento: Pagamento = {
      id: '1',
      idPagamento: 123456789,
      cpfCnpj: '12345678909',
      metodoPagamento: MetodoPagamento.PIX,
      valor: 100.50,
      status: PagamentoStatus.PENDENTE_PROCESSAMENTO,
      ativo: true
    };
    
    pagamentoServiceSpy.criarPagamento.and.returnValue(of(mockPagamento));
    spyOn(component.pagamentoCriado, 'emit');
    spyOn(component, 'fecharModal');

    component.pagamentoForm.patchValue({
      cpfCnpj: '123.456.789-09',
      metodoPagamento: 'PIX',
      valor: 100.50
    });
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', null);
    tick();

    const payloadEnviado = pagamentoServiceSpy.criarPagamento.calls.mostRecent().args[0];
    expect(payloadEnviado).toEqual(jasmine.objectContaining({
      cpfCnpj: '12345678909',
      metodoPagamento: 'PIX',
      valor: '100.5',
      status: 'PENDENTE_PROCESSAMENTO',
      ativo: true
    }));
    expect(payloadEnviado.idPagamento).toBeGreaterThanOrEqual(100000000);
    expect(component.pagamentoCriado.emit).toHaveBeenCalled();
    expect(component.fecharModal).toHaveBeenCalled();
  }));

  it('deve tratar erro ao salvar pagamento', fakeAsync(() => {
    const errorResponse = { message: 'Erro de teste' };
    pagamentoServiceSpy.criarPagamento.and.returnValue(throwError(() => errorResponse));
    spyOn(console, 'error');
    spyOn(window, 'alert');

    component.pagamentoForm.patchValue({
      cpfCnpj: '12345678909',
      metodoPagamento: 'PIX',
      valor: 50.00
    });
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', null);
    tick();

    expect(console.error).toHaveBeenCalledWith('Erro detalhado:', jasmine.any(Object));
    expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Erro de teste'));
  }));

  it('deve enviar número do cartão sem formatação quando método for cartão', fakeAsync(() => {
    
    const numeroCartaoFormatado = '4111 1111 1111 1111';
    const numeroCartaoEsperado = '4111111111111111'; 

    component.pagamentoForm.patchValue({
      cpfCnpj: '12345678909',
      metodoPagamento: 'CARTAO_CREDITO',
      numeroCartao: numeroCartaoFormatado,
      valor: 100.50
    });
    fixture.detectChanges();

    pagamentoServiceSpy.criarPagamento.and.returnValue(of({} as Pagamento));

    component.salvarPagamento();
    tick();

    expect(pagamentoServiceSpy.criarPagamento).toHaveBeenCalled();
    
    const payloadEnviado = pagamentoServiceSpy.criarPagamento.calls.mostRecent().args[0];
    
    expect(payloadEnviado.numeroCartao).toBe(numeroCartaoEsperado);
    expect(payloadEnviado.numeroCartao.length).toBe(16);
    expect(payloadEnviado.numeroCartao).toMatch(/^\d+$/);
    
    expect(console.log).toHaveBeenCalledWith(
      'Payload final:', 
      jasmine.objectContaining({
        numeroCartao: numeroCartaoEsperado
      })
    );
  }));

  it('não deve enviar formulário inválido', () => {
    component.pagamentoForm.patchValue({
      cpfCnpj: '',
      metodoPagamento: 'PIX',
      valor: null
    });
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();

    expect(pagamentoServiceSpy.criarPagamento).not.toHaveBeenCalled();
  });

  it('não deve chamar o serviço quando formulário é inválido', () => {

    component.pagamentoForm.setErrors({ invalid: true });
    fixture.detectChanges();

    component.salvarPagamento();

    expect(pagamentoServiceSpy.criarPagamento).not.toHaveBeenCalled();
    expect(component.pagamentoForm.invalid).toBeTrue();
  });

  it('não deve incluir numeroCartao no payload quando método não for cartão', fakeAsync(() => {
    
    component.pagamentoForm.patchValue({
      cpfCnpj: '12345678909',
      metodoPagamento: 'PIX',
      valor: 100.50,
      numeroCartao: '4111 1111 1111 1111'
    });
    fixture.detectChanges();

    pagamentoServiceSpy.criarPagamento.and.returnValue(of({} as Pagamento));

    component.salvarPagamento();
    tick();

    const payload = pagamentoServiceSpy.criarPagamento.calls.mostRecent().args[0];

    expect(payload.numeroCartao).toBeUndefined();
    expect(Object.keys(payload).includes('numeroCartao')).toBeFalse();
  }));

});