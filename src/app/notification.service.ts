import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  showSuccess(message: string, title: string): void {
    this.toastr.success(message, title, { positionClass:'toast-custom',closeButton:true });
  }

  showError(message: string, title: string): void {
    this.toastr.error(message, title, { closeButton: true });
  }

  showInfo(message: string, title: string): void {
    this.toastr.info(message, title, { closeButton: true });
  }

  showWarning(message: string, title: string): void {
    this.toastr.warning(message, title, { closeButton: true });
  }
}
