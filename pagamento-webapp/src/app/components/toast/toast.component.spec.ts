import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../services/toast.service';
import { Subject } from 'rxjs';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastServiceMock: {
    toast$: Subject<{ message: string; type: 'success' | 'error' }>
  };

  beforeEach(async () => {
    toastServiceMock = {
      toast$: new Subject()
    };

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado corretamente', () => {
      expect(component).toBeTruthy();
  });

  it('deve exibir mensagem no template quando show=true', () => {
    component.show = true;
    component.message = 'Mensagem teste';
    fixture.detectChanges();
    
    const element = fixture.nativeElement.querySelector('div');
    expect(element.textContent).toContain('Mensagem teste');
  });

  it('deve exibir toast quando receber mensagem', () => {
      toastServiceMock.toast$.next({ 
      message: 'Teste', 
      type: 'success' 
    });
    
    fixture.detectChanges();
    
    expect(component.show).toBeTrue();
    expect(component.message).toBe('Teste');
    expect(component.toastClass).toContain('bg-green-500');
  });

  it('deve fechar automaticamente após 3 segundos', fakeAsync(() => {
    toastServiceMock.toast$.next({ 
      message: 'Teste', 
      type: 'error' 
    });
    
    tick(2999);
    expect(component.show).toBeTrue();
    
    tick(1);
    expect(component.show).toBeFalse();
  }));

  it('deve aplicar classes CSS corretas por tipo', () => {
    
    toastServiceMock.toast$.next({ 
      message: 'Erro', 
      type: 'error' 
    });
    expect(component.toastClass).toContain('bg-red-500');

    toastServiceMock.toast$.next({ 
      message: 'Sucesso', 
      type: 'success' 
    });
    expect(component.toastClass).toContain('bg-green-500');
  });

  it('deve cancelar subscription no ngOnDestroy', () => {
    const spy = spyOn(component['sub'], 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

});