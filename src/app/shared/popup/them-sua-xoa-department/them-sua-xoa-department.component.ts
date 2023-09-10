import { HttpResponse } from "@angular/common/http";
import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { ConfirmDialogComponent } from "app/layouts/confirm-dialog/confirm-dialog.component";
import { NotificationService } from "app/notification.service";

@Component({
  selector: "department-popup",
  templateUrl: "./them-sua-xoa-department.component.html",
})
export class DepartmentPopup implements OnInit {
  @Input() data?: any;
  @Input() id?: any;
  @Input() title?: any;
  @Input() type?: any;
  ma = "";
  ten = "";
  trangThai:any;
  ghiChu = "";
  REQUEST_URL = "/api/v1/department";
  listStatus: any[] = [
    {
      name: "Không hoạt động",
      value: 0,
    },
    {
      name: "Hoạt động",
      value: 1,
    },
  ];
  constructor(
    private activeModal: NgbActiveModal,
    private dmService: DanhMucService,
    private notification: NotificationService,
    private modalService: NgbModal
  ) {}
  ngOnInit(): void {
    if (this.data) {
      this.ma = this.data.code;
      this.ten = this.data.name;
      this.trangThai = this.data.status;
      this.ghiChu = this.data.note;
    }
    console.log(this.data)
  }

  create() {    
    console.log(1)
      if (!this.ma.trim()) {
        this.notification.showError("Mã không được để trống", "Fail");
        return;
      }
      if (this.ma.trim().length < 5) {
        this.notification.showError("Mã phải có ít nhất 5 ký tự", "Fail");
        return;
      }
      if (!this.ten.trim()) {
        this.notification.showError("Tên không được để trống", "Fail");
        return;
      }
      const entity = {
        id: this.data ? this.data.id : 0,
        code: this.ma ? this.ma.trim().toUpperCase() : "",
        name: this.ten ? this.ten.trim() : "",
        status: this.trangThai,
        note: this.ghiChu,
      };
      if (!this.data ) {
        delete entity.id;
        this.dmService.postOption(entity, this.REQUEST_URL,'').subscribe(
          (res: HttpResponse<any>) => {
            if (res.body.statusCode === 200) {
              this.notification.showSuccess("Tạo phòng ban thành công", "Success");
              this.accept();
            } else {
              this.notification.showError("Tạo phòng ban thất bại", "Fail");
              this.dismiss();
            }
          },
          () => {
            this.notification.showError("Tạo phòng ban thất bại", "Fail");
            console.error();
          }
        );
      }else {
      this.dmService
        .putOption(entity, this.REQUEST_URL, "?id=" + entity.id)
        .subscribe(
          (res: HttpResponse<any>) => {
            if (res.body.statusCode === 200) {
              this.notification.showSuccess(
                "Cập nhật phòng ban thành công",
                "Success"
              );
              this.accept();
              
            } else {
              this.notification.showError("Cập nhật phòng ban thất bại", "Fail");
              this.dismiss();
              
            }
          },
          () => {
            this.notification.showError("Cập nhật phòng ban thất bại", "Fail");
            console.error();
          }
        );
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
