import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ToastService } from './services/toast.service';
import { Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Subject } from 'rxjs';
import { PagamentoListaComponent } from './components/pagamento-lista/pagamento-lista.component';


@Component({
  selector: 'app-pagamento-lista',
  template: '',
  standalone: true
})
class MockPagamentoListaComponent {
  loadPagamentos(): void { } 
}


@Component({
  selector: 'app-pagamento-form',
  template: '',
  standalone: true
})
class MockPagamentoFormComponent {}

@Component({
  selector: 'app-toast',
  template: '',
  standalone: true
})
class MockToastComponent {}

class MockToastService {
  show = jasmine.createSpy('show');
  toast$ = new Subject<any>();
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let toastService: MockToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        AppComponent,
        MockPagamentoListaComponent,
        MockPagamentoFormComponent,
        MockToastComponent
      ],
      providers: [
        { provide: ToastService, useClass: MockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService) as unknown as MockToastService;

    component.pagamentoListaComponent = new MockPagamentoListaComponent() as PagamentoListaComponent;
    
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('openNovoPagamentoModal deve definir showFormModal como true', () => {
    component.showFormModal = false;
    component.openNovoPagamentoModal();
    expect(component.showFormModal).toBe(true);
  });

  it('closeFormModal deve definir showFormModal como false', () => {
    component.showFormModal = true;
    component.closeFormModal();
    expect(component.showFormModal).toBe(false);
  });
  
  it('onPagamentoCriado deve carregar pagamentos e mostrar um toast de sucesso', () => {

    const mockPagamentoLista = component.pagamentoListaComponent as MockPagamentoListaComponent;
    
    spyOn(mockPagamentoLista, 'loadPagamentos');
    
    component.onPagamentoCriado();
    
    expect(mockPagamentoLista.loadPagamentos).toHaveBeenCalled();
    expect(toastService.show).toHaveBeenCalledWith('Pagamento criado com sucesso!', 'success');
  });

  it('showToastMessage deve chamar o serviço de toast com a mensagem e o tipo corretos', () => {
    const mensagem = 'Teste de mensagem';
    const tipo = 'error';
    
    component.showToastMessage(mensagem, tipo);
    expect(toastService.show).toHaveBeenCalledWith(mensagem, tipo);
  });
});