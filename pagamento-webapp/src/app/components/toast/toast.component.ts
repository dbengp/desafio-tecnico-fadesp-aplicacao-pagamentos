import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
})
export class ToastComponent implements OnDestroy {
  show = false;
  message = '';
  toastClass = '';
  private sub: Subscription;

  constructor(private toastService: ToastService) {
    this.sub = this.toastService.toast$.subscribe(({ message, type }) => {
      this.message = message;
      this.toastClass = type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
      this.show = true;
      setTimeout(() => this.show = false, 3000);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}