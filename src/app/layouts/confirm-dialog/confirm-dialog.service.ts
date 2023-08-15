import { Injectable } from "@angular/core";

import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { ConfirmDialogComponent } from "./confirm-dialog.component";

@Injectable({ providedIn: "root" })
export class ConfirmationDialogService {
  constructor(private modalService: NgbModal) {}

  public confirm(
    message: string,
    btnOkText?: string,
    btnCancelText?: string,
    dialogSize: "sm" | "lg" = "lg"
  ): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: dialogSize,
      windowClass: "inpopup box-shadow-modal",
    });
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;

    return modalRef.result;
  }
}
