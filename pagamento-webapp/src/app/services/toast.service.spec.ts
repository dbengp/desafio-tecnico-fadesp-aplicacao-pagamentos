import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { firstValueFrom } from 'rxjs';


interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve emitir uma mensagem de sucesso ao chamar show() sem tipo', async () => {
    const toastPromise = firstValueFrom(service.toast$);
    const message = 'Operação realizada com sucesso!';
    service.show(message);

    const emittedToast = await toastPromise;
    const expectedToast: ToastMessage = { message: message, type: 'success' };

    expect(emittedToast).toEqual(expectedToast);
  });

  it('deve emitir uma mensagem de erro com o tipo correto', async () => {
    const toastPromise = firstValueFrom(service.toast$);

    const message = 'Ocorreu um erro!';
    const type = 'error';
    service.show(message, type);

    const emittedToast = await toastPromise;
    const expectedToast: ToastMessage = { message: message, type: type };

    expect(emittedToast).toEqual(expectedToast);
  });

  it('deve emitir uma mensagem de sucesso com o tipo correto', async () => {
    const toastPromise = firstValueFrom(service.toast$);

    const message = 'Dados salvos.';
    const type = 'success';
    service.show(message, type);

    const emittedToast = await toastPromise;
    const expectedToast: ToastMessage = { message: message, type: type };

    expect(emittedToast).toEqual(expectedToast);
  });
});