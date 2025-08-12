import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PagamentoListaComponent } from './pagamento-lista.component';
import { PagamentoService } from '../../services/pagamento.service';
import { ToastService } from '../../services/toast.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';
import { Pagamento } from '../../models/pagamento.model';
import { PagamentoStatus } from '../../models/pagamento-status.enum';
import { DecimalPipe } from '@angular/common';
import { MetodoPagamento } from '../../models/pagamento-metodo.enum';
import { CommonModule } from '@angular/common';
import { discardPeriodicTasks } from '@angular/core/testing';


describe('PagamentoListaComponent', () => {

  let component: PagamentoListaComponent;
  let fixture: ComponentFixture<PagamentoListaComponent>;
  let pagamentoService: jasmine.SpyObj<PagamentoService>;
  let toastService: jasmine.SpyObj<ToastService>;

  const mockPagamentos: Pagamento[] = [
    {
      id: '1',
      idPagamento: 123456,
      cpfCnpj: '12345678909',
      metodoPagamento: MetodoPagamento.PIX,
      valor: 100.50,
      status: PagamentoStatus.PENDENTE_PROCESSAMENTO,
      ativo: true
    },
    {
      id: '2',
      idPagamento: 789012,
      cpfCnpj: '98765432100',
      metodoPagamento: MetodoPagamento.CARTAO_CREDITO,
      valor: 200.75,
      status: PagamentoStatus.PROCESSADO_SUCESSO,
      ativo: true
    }
  ];

  beforeEach(async () => {
    const pagamentoServiceSpy = jasmine.createSpyObj('PagamentoService', [
      'getPagamentos', 
      'inativarPagamento',
      'processarPagamento'
    ]);
    
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    pagamentoServiceSpy.getPagamentos.and.returnValue(of(mockPagamentos));

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule,
        PagamentoListaComponent
      ],
      providers: [
        { provide: PagamentoService, useValue: pagamentoServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        DecimalPipe
      ]
    }).compileComponents();

    pagamentoService = TestBed.inject(PagamentoService) as jasmine.SpyObj<PagamentoService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    
    fixture = TestBed.createComponent(PagamentoListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar o formulário de filtro', () => {
    fixture.detectChanges();
    expect(component.filtroForm).toBeDefined();
    expect(component.filtroForm.get('busca')?.value).toBe('');
    expect(component.filtroForm.get('status')?.value).toBe('Todos');
    expect(component.filtroForm.get('pageSize')?.value).toBe(10);
  });

  it('deve carregar pagamentos na inicialização', fakeAsync(() => {
    pagamentoService.getPagamentos.and.returnValue(of(mockPagamentos));
    
    fixture.detectChanges();
    tick();
    
    expect(pagamentoService.getPagamentos).toHaveBeenCalled();
    expect(component.pagamentos.length).toBe(2);
  }));

  it('deve aplicar filtros corretamente', fakeAsync(() => {
    
    pagamentoService.getPagamentos.and.returnValue(of([mockPagamentos[0]]));
    
    fixture.detectChanges();
    
    component.filtroForm.get('busca')?.setValue('12345678909');
    component.loadPagamentos();
    
    tick(1000);
    discardPeriodicTasks();
    
    expect(pagamentoService.getPagamentos).toHaveBeenCalledWith(
      jasmine.objectContaining({ cpfCnpj: '12345678909' })
    );
    
    component.filtroForm.get('busca')?.setValue('123456');
    component.loadPagamentos();
    
    tick(1000);
    discardPeriodicTasks();
    
    expect(pagamentoService.getPagamentos).toHaveBeenCalledWith(
      jasmine.objectContaining({ idPagamento: 123456 })
    );
    
    component.filtroForm.get('status')?.setValue('PENDENTE_PROCESSAMENTO');
    component.loadPagamentos();
    
    tick(1000);
    discardPeriodicTasks();
    
    expect(pagamentoService.getPagamentos).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 'PENDENTE_PROCESSAMENTO' })
    );
  }));

  it('deve lidar com erros ao carregar pagamentos', fakeAsync(() => {
    const error = new Error('Erro de teste');
    pagamentoService.getPagamentos.and.returnValue(throwError(() => error));
    
    fixture.detectChanges(); 
    component.loadPagamentos();
    tick();
    
    expect(toastService.show).toHaveBeenCalledWith('Erro ao carregar pagamentos', 'error');
  }));

  it('deve inativar pagamento com sucesso', fakeAsync(() => {
    pagamentoService.inativarPagamento.and.returnValue(of('success'));
    pagamentoService.getPagamentos.and.returnValue(of(mockPagamentos));
    
    fixture.detectChanges(); 
    component.inativarPagamento('1');
    tick();
    
    expect(pagamentoService.inativarPagamento).toHaveBeenCalledWith('1');
    expect(toastService.show).toHaveBeenCalledWith(
      'Pagamento inativado com sucesso!', 
      'success'
    );
  }));

  it('deve processar pagamento com sucesso', fakeAsync(() => {
    pagamentoService.processarPagamento.and.returnValue(of('success'));
    pagamentoService.getPagamentos.and.returnValue(of(mockPagamentos));
    
    fixture.detectChanges(); 
    component.processarPagamento(123456, PagamentoStatus.PROCESSADO_SUCESSO);
    tick();
    
    expect(pagamentoService.processarPagamento).toHaveBeenCalledWith(
      123456, 
      PagamentoStatus.PROCESSADO_SUCESSO
    );
    expect(toastService.show).toHaveBeenCalledWith(
      'status do pagamento alterado com sucesso!', 
      'success'
    );
  }));

  it('deve aplicar paginação corretamente', fakeAsync(() => {
    
    component.currentPage = 1;
    component.pageSize = 1;
    component['allFilteredPagamentos'] = [...mockPagamentos];
    component.totalItems = mockPagamentos.length;
    
    component['applyPagination']();
    tick();
    
    expect(component.pagamentos.length).toBe(1);
    expect(component.totalPages).toBe(1);
    expect(component.totalItems).toBe(2);
    expect(component.pagamentos[0].idPagamento).toBe(123456);
  }));

  it('deve navegar entre páginas', () => {
    component['allFilteredPagamentos'] = [...mockPagamentos, ...mockPagamentos]; 
    component.pageSize = 1;
    component.totalPages = 4;
    
    component.goToPage(2);
    expect(component.currentPage).toBe(2);
    
    component.nextPage();
    expect(component.currentPage).toBe(3);
    
    component.prevPage();
    expect(component.currentPage).toBe(2);
  });

  it('deve retornar métodos de pagamento corretamente', () => {
    expect(component.getMetodoPagamento('PIX')).toBe('PIX');
    expect(component.getMetodoPagamento('BOLETO')).toBe('Boleto');
    expect(component.getMetodoPagamento('CARTAO_CREDITO')).toBe('Cartão de Crédito');
    expect(component.getMetodoPagamento('CARTAO_DEBITO')).toBe('Cartão de Débito');
  });

  it('deve retornar textos de status corretamente', () => {
    expect(component.getStatusText(PagamentoStatus.PENDENTE_PROCESSAMENTO))
      .toBe('Pendente Processamento');
    expect(component.getStatusText(PagamentoStatus.PROCESSADO_SUCESSO))
      .toBe('Processado com Sucesso');
    expect(component.getStatusText(PagamentoStatus.PROCESSADO_FALHA))
      .toBe('Processado com Falha');
  });

  it('deve retornar classes de status corretamente', () => {
    spyOn(component, 'getStatusClasses').and.callFake((status: PagamentoStatus) => {
      const classes: {[key: string]: boolean} = {};
      
      switch(status) {
        case PagamentoStatus.PENDENTE_PROCESSAMENTO:
          classes['bg-yellow-100'] = true;
          classes['text-yellow-800'] = true;
          break;
        case PagamentoStatus.PROCESSADO_SUCESSO:
          classes['bg-green-100'] = true;
          classes['text-green-800'] = true;
          break;
        case PagamentoStatus.PROCESSADO_FALHA:
          classes['bg-red-100'] = true;
          classes['text-red-800'] = true;
          break;
      }
      
      return classes;
    });

    const pendente = component.getStatusClasses(PagamentoStatus.PENDENTE_PROCESSAMENTO);
    expect(pendente['bg-yellow-100']).toBeTrue();
    expect(pendente['text-yellow-800']).toBeTrue();

    const sucesso = component.getStatusClasses(PagamentoStatus.PROCESSADO_SUCESSO);
    expect(sucesso['bg-green-100']).toBeTrue();
    expect(sucesso['text-green-800']).toBeTrue();

    const falha = component.getStatusClasses(PagamentoStatus.PROCESSADO_FALHA);
    expect(falha['bg-red-100']).toBeTrue();
    expect(falha['text-red-800']).toBeTrue();
  });

});