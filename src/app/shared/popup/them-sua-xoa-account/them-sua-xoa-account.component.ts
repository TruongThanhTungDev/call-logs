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
  @Input() type?: any;
  @ViewChild("formLogin")
  formLogin!: NgForm;
  users: any;
  username: any;
  password: any;
  email: any;
  retypePassword: any;
  sdt: any;
  address: any;
  name: any;
  role: any;
  roleID: any;
  callCode: any
  listDepartment: any = [];
  listSelect: any = [];
  department: any;

  REQUEST_URL = "/api/v1/user";
  REQUEST_URL_DEPARTMENT = "/api/v1/department";
  REQUEST_URL_ROLE = "/api/v1/role";
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
      this.name = this.data.name;
      this.email = this.data.email;
      this.sdt = this.data.phone;
      this.address = this.data.address;
      this.role = this.data.roleId;
      this.callCode = this.data.callCode
      // this.listSelect = this.data.department ? this.data.department.split(",") : [];
      this.department = this.data.department.id;
      console.log(this.data);
    }
  }
  loadData(): void {
    this.getDepartment();
  }
  getDepartment() {
    const payload = {
      page: 0,
      size: 100,
      filter: `id>0;status==1`,
      sort: ["id", "asc"],
    };
    this.dmService.query(payload, this.REQUEST_URL_DEPARTMENT).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body.statusCode === 200) {
          this.listDepartment = res.body.result.content;
        } else {
          this.notification.showError(res.body.MESSAGE, "Fail");
        }
      },
      () => {
        this.notification.showError("Đã có lỗi xảy ra", "Fail");
        console.error();
      }
    );
  }
  create() {
    if (this.validData()) {
      let entity = {
        id: "",
        userName: this.username,
        password: this.password,
        email: this.email,
        phone: this.sdt,
        address: this.address,
        name: this.name,
        roleId: this.role,
        departmentId: this.department,
        isActive: 0,
        code: null,
        callCode: this.callCode ? this.callCode.toUpperCase() : '',
      };
      if (!this.data) {
        if (entity.departmentId == "") {
          this.notification.showError(
            "Vui lòng lựa chọn phòng ban cho user!",
            "Fail"
          );
        } else {
          this.dmService
            .postOption(entity, "/api/v1/user/create", "")
            .subscribe(
              (res: HttpResponse<any>) => {
                if (res.body.statusCode === 200) {
                  this.notification.showSuccess(
                    "Tạo user thành công",
                    "Success"
                  );
                  this.accept();
                } else {
                  this.notification.showError("Tạo user thất bại", "Fail");
                  this.dismiss();
                }
              },
              () => {
                this.notification.showError("Tạo user thất bại", "Fail");
                console.error();
              }
            );
        }
      } else {
        entity.id = this.data.id;
        if (entity.departmentId == "") {
          this.notification.showError(
            "Vui lòng lựa chọn department cho user!",
            "Fail"
          );
        } else {
          this.dmService
            .postOption(entity, "/api/v1/user/update", "")
            .subscribe(
              (res: HttpResponse<any>) => {
                if (res.body.statusCode === 200) {
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
