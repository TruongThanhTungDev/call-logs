import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmDialogComponent } from "app/layouts/confirm-dialog/confirm-dialog.component";
import { jqxDateTimeInputComponent } from "jqwidgets-ng/jqxdatetimeinput";

@Component({
  selector: "jhi-TongKetDuLieuPopup",
  templateUrl: "./TongKetDuLieuPopup.component.html",
  styleUrls: ["./TongKetDuLieuPopup.component.scss"],
})
export class TongKetDuLieuPopupComponent implements OnInit {
  @ViewChild("myDateTimeInput", { static: false })
  myDateTimeInput: jqxDateTimeInputComponent;
  @Input() data?: any;

  constructor(
    private activeModal: NgbActiveModal,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {}

  onGiveShip(): void {
    window.open("#/bill?id=" + this.data.id);
  }

  dateOnChange(): void {
    let selection = this.myDateTimeInput.getRange();
    if (selection.from != null) {
      const string =
        "<div>From: " +
        selection.from.toLocaleDateString() +
        " <br/>To: " +
        selection.to.toLocaleDateString() +
        "</div>";
    }
  }

  public decline(): void {
    this.activeModal.close(false);
  }

  public accept(): void {
    this.activeModal.close(true);
  }

  public dismiss(): void {
    this.activeModal.dismiss();
  }
  closeModal() {
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: "sm",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.message = "Bạn có chắc chắn muốn thoát không?";
    modalRef.componentInstance.btnOkText = "Đồng ý";
    modalRef.componentInstance.btnCancelText = "Hủy";
    modalRef.result.then(
      () => {
        this.decline();
      },
      () => {}
    );
  }
}
