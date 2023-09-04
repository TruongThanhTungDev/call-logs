import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { HttpResponse } from "@angular/common/http";
import { NgForm } from "@angular/forms";
import { NotificationService } from "app/notification.service";
import { ConfirmDialogComponent } from "app/layouts/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-them-sua-xoa-account",
  templateUrl: "./them-sua-xoa-account.component.html",
  styleUrls: ["./them-sua-xoa-account.component.scss"],
})
export class ThemSuaXoaAccountComponent implements OnInit {
  @Input() data?: any;
  @Input() id?: any;
  @Input() title?: any;

  @ViewChild("formLogin")
  formLogin!: NgForm;
  users: any;
  username = "";
  password = "";
  email = "";
  retypePassword = "";
  sdt = "";
  address = "";
  fullName = "";
  role = "user";
  listShop: any = [];
  listSelect: any = [];

  REQUEST_URL = "/api/v1/account";
  REQUEST_URL_SHOP = "/api/v1/shop";
  constructor(
    private activeModal: NgbActiveModal,
    private dmService: DanhMucService,
    private notification: NotificationService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadData();
    if (this.data) {
      this.username = this.data.userName;
      this.fullName = this.data.fullName;
      this.email = this.data.email;
      this.sdt = this.data.phone;
      this.address = this.data.address;
      this.role = this.data.role;
      this.listSelect = this.data.shop ? this.data.shop.split(",") : [];
    }
  }

  loadData(): void {
    this.dmService
      .getOption(null, this.REQUEST_URL_SHOP, "?status=1")
      .subscribe(
        (res: HttpResponse<any>) => {
          this.listShop = res.body.RESULT;
        },
        () => {
          console.error();
        }
      );
  }

  create() {
    if (this.validData()) {
      let entity = {
        id: "",
        userName: this.username,
        passWord: this.password,
        email: this.email,
        phone: this.sdt,
        address: this.address,
        fullName: this.fullName,
        role: this.role,
        shop: this.listSelect.toString(),
      };
      if (!this.data) {
        if (entity.role == "user" && entity.shop == "") {
          this.notification.showError(
            "Vui lòng lựa chọn shop cho user!",
            "Fail"
          );
        } else {
          this.dmService
            .postOption(entity, "/api/v1/account/create", "")
            .subscribe(
              (res: HttpResponse<any>) => {
                if (res.body.CODE === 200) {
                  this.notification.showSuccess(
                    "Tạo account thành công",
                    "Success"
                  );
                  this.accept();
                } else {
                  this.notification.showError("Tạo account thất bại", "Fail");
                  this.dismiss();
                }
              },
              () => {
                this.notification.showError("Tạo account thất bại", "Fail");
                console.error();
              }
            );
        }
      } else {
        entity.id = this.data.id;
        if (entity.role == "user" && entity.shop == "") {
          this.notification.showError(
            "Vui lòng lựa chọn shop cho user!",
            "Fail"
          );
        } else {
          this.dmService
            .putOption(entity, "/api/v1/account/update?id=" + entity.id, "")
            .subscribe(
              (res: HttpResponse<any>) => {
                if (res.body.CODE === 200) {
                  this.notification.showSuccess(
                    "Cập nhật tài khoản thành công",
                    "Success"
                  );
                  this.accept();
                } else {
                  this.notification.showError(
                    "Cập nhật tài khoản thất bại",
                    "Fail"
                  );
                  this.dismiss();
                }
              },
              () => {
                this.notification.showError(
                  "Cập nhật tài khoản thất bại",
                  "Fail"
                );
                console.error();
              }
            );
        }
      }
    }
  }

  validData() {
    if (this.password !== this.retypePassword) {
      this.notification.showError("Mật khẩu không khớp", "Fail");
      return false;
    }
    return true;
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
