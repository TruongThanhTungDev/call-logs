import { HttpResponse } from "@angular/common/http";
import { AfterViewInit, Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { ConfirmationDialogService } from "app/layouts/confirm-dialog/confirm-dialog.service";
import { NotificationService } from "app/notification.service";
import { ThemSuaXoaAccountComponent } from "app/shared/popup/them-sua-xoa-account/them-sua-xoa-account.component";
import $ from "jquery";
import { LocalStorageService } from "ngx-webstorage";
import { OPERATIONS } from "../../app.constants";
import { ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "account-cmp",
  templateUrl: "account.component.html",
})
export class AccountComponent implements OnInit, AfterViewInit {
  itemsPerPage = 10;
  page = 1;
  totalItems = 0;
  previousPage = 1;
  sort = "id";
  sortType = true;
  REQUEST_URL = "/api/v1/user";
  REQUEST_URL_DEPARTMENT = "/api/v1/department";
  REQUEST_URL_ROLE = "/api/v1/role";
  REQUEST_URL_ROLE_USER = "/api/v1/role_user";
  listEntity = [];
  info: any;
  selectedEntity: any = null;
  selectedId = 0;
  roleID = "";
  department: any;
  listDepartment: any[] = [];
  params = {
    page: 1,
    itemsPerPage: 10,
    userName: "",
    name: "",
    email: "",
    address: "",
    role: "",
    note: "",
  };
  constructor(
    private dmService: DanhMucService,
    private notificationService: NotificationService,
    private confirmDialogService: ConfirmationDialogService,
    private modalService: NgbModal,
    private localStorage: LocalStorageService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService
  ) {
    this.info = this.localStorage.retrieve("authenticationtoken");
  }

  ngOnInit() {
    this.getDepartment();
    this.loadData();
    this.scriptPage();
  }
  ngAfterViewInit(): void {}
  public loadData() {
    const params = {
      sort: [this.sort, this.sortType ? "desc" : "asc"],
      page: this.page - 1,
      size: this.itemsPerPage,
      filter: this.filterData(),
    };
    this.spinner.show();
    this.dmService.query(params, this.REQUEST_URL).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body) {
          if (res.body.statusCode === 200) {
            this.spinner.hide();
            this.page = res.body ? res.body.result.number + 1 : 1;
            this.totalItems = res.body ? res.body.result.totalElements : 0;
            this.checkRoleUser(res.body.result.content)
            // load page
            if (this.listEntity.length === 0 && this.page > 1) {
              this.page = 1;
              this.loadData();
            }
          } else {
            this.spinner.hide();
            this.notificationService.showError(
              res.body.MESSAGE,
              "Error message"
            );
          }
        } else {
          this.spinner.hide();
          this.notificationService.showError(
            "Đã có lỗi xảy ra",
            "Error message"
          );
        }
      },
      () => {
        this.spinner.hide();
        this.notificationService.showError("Đã có lỗi xảy ra", "Error message");
        console.error();
      }
    );
    this.department = "";
  }
  checkRoleUser(data) {
    const payload = {
      page: this.page - 1,
      size: this.itemsPerPage,
      sort: [this.sort, this.sortType ? "desc" : "asc"],
      filter: this.filterRole(),
    }
    this.dmService.getOption(payload, this.REQUEST_URL_ROLE_USER, '/search')
    .subscribe(
      (res: HttpResponse<any>) => {
        if(res.body.statusCode === 200) {
          this.spinner.hide()
         this.listEntity = data.map(item => ({
          ...item,
          roleId: this.findRole(item.id, res.body.result.content)
         }))
        } else {
          this.spinner.hide()
        }
      },
      () => {
        this.spinner.hide()
      }
    )
  }
  findRole(userId, list) {
    const result = list.find(item => item.userId == userId)
    return result ? result.userId : ''
  }
  filterRole() {
    const filter = []
    filter.push("id>0")
    return filter.join(";")
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
          this.notificationService.showError(res.body.MESSAGE, "Fail");
        }
      },
      () => {
        this.notificationService.showError("Đã có lỗi xảy ra", "Fail");
        console.error();
      }
    ); 
  }
  getRole(role: any) {
    const payload = {
      page: 0,
      size: 100,
      filter: `id>0;name=="*${role.trim()}*"`,
      sort: ["id", "asc"],
    };
    this.dmService.query(payload, this.REQUEST_URL_ROLE).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body.statusCode === 200) {
          this.roleID = res.body.result.content.id;
        } else {
          this.notificationService.showError(res.body.MESSAGE, "Fail");
        }
      },
      () => {
        this.notificationService.showError("Đã có lỗi xảy ra", "Fail");
        console.error();
      }
    );
  }
  public filterData() {
    const filter = [];
    this.params.page = 1;
    filter.push("id>0");
    if (this.params.name) {
      filter.push(`name=="*${this.params.name.trim()}*"`);
    }
    if (this.params.role) {
      filter.push(`roleId==${this.params.role}`);
    }
    if (this.params.address) {
      filter.push(`address=="*${this.params.address.trim()}*"`);
    }
    if (this.params.userName) {
      filter.push(`userName=="*${this.params.userName.trim()}*"`);
    }
    if (this.params.email) {
      filter.push(`email=="*${this.params.email.trim()}*"`);
    }
    if (this.params.note) {
      filter.push(`note=="*${this.params.note.trim()}*"`);
    }
    if (this.department) {
      filter.push(`department.id==${this.department}`);
    }
    return filter.join(";");
  }
  // private filter(): string {
  //   const comparesArray: string[] = [];
  //   const {
  //     FtTaiKhoan,
  //     FtHoTen,
  //     FtDiaChi,
  //     FtEmail,
  //     FtGhiChu,
  //     FtPhanQuyen,
  //     FtSdt,
  //     department,
  //   } = this;
  //   this.getRole(FtPhanQuyen)
  //   comparesArray.push(`id>0`);
  //   if (FtHoTen) comparesArray.push(`name=="*${FtHoTen.trim()}*"`);
  //   if (FtTaiKhoan) comparesArray.push(`userName=="*${FtTaiKhoan.trim()}*"`);
  //   if (FtDiaChi) comparesArray.push(`address=="*${FtDiaChi.trim()}*"`);
  //   if (FtEmail) comparesArray.push(`email=="*${FtEmail.trim()}*"`);
  //   if (FtGhiChu) comparesArray.push(`note=="*${FtGhiChu.trim()}*"`);
  //   if (FtPhanQuyen) comparesArray.push(`roleId=="*${this.roleID.trim()}*"`);
  //   if (FtSdt) comparesArray.push(`phone=="*${FtSdt.trim()}*"`);
  //   if (this.department)
  //     comparesArray.push(`department=="*${department.trim()}*"`);
  //   return comparesArray.join(";");
  // }

  filterPhanQuyen(e: any): void {
    this.params.role = e;
    this.loadData();
  }

  sortData(e: any) {
    if (e !== this.sort) {
      this.sort = e;
      this.loadData();
    } else {
      this.sortType = !this.sortType;
      this.loadData();
    }
  }

  processFilter() {
    this.loadData();
  }
  public updateData(user: any) {
    const modalRef = this.modalService.open(ThemSuaXoaAccountComponent, {
      size: "lg",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.data = user;
    modalRef.componentInstance.title = "Xử lý thông tin tài khoản";
    modalRef.componentInstance.type = "edit";
    modalRef.result.then(
      () => {
        this.loadData();
      },
      () => {}
    );
  }
  reset() {
    this.selectedEntity = "";
    this.department = "";
    this.loadData();
  }
  public createData() {
    const modalRef = this.modalService.open(ThemSuaXoaAccountComponent, {
      size: "lg",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.data = null;
    modalRef.componentInstance.title = "Tạo tài khoản";
    modalRef.componentInstance.type = "add";

    modalRef.result.then(
      () => {
        this.loadData();
      },
      () => {}
    );
  }
  filterPhongBan(department: any) {
    this.department = department;
    this.loadData();
  }
  handleDeleteUser(id: any) {
    this.confirmDialogService
      .confirm("Bạn có thật sự muốn xóa bản ghi này?", "Đồng ý", "Hủy")
      .then((confirmed: any) => {
        if (confirmed) {
          this.spinner.show();
          this.dmService.delete(id, this.REQUEST_URL).subscribe(
            (res: HttpResponse<any>) => {
              if (res.body.statusCode === 200) {
                this.spinner.hide();
                this.notificationService.showSuccess(
                  "Xóa thành công",
                  "Success"
                );
                setTimeout(() => {
                  this.loadData();
                }, 100);
              } else {
                this.spinner.hide();
                this.notificationService.showError("Xóa thất bại", "Fail");
              }
            },
            () => {
              this.spinner.hide();
              console.error();
            }
          );
        }
      })
      .catch(() => console.error());
  }
  public onRowSelect(event: any): void {
    this.selectedEntity = event;
    this.selectedId = event.id;
  }
  public onRowdblclick(event: any): void {
    this.selectedEntity = event;
    this.updateData(event);
  }
  loadPage(page: number): void {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.loadData();
    }
  }
  scriptPage(): void {
    $(window).resize(function (): void {
      if ($(window).height() > 800) {
        $(".boxscroll").height($(window).height()! - 300);
      } else {
        $(".boxscroll").height($(window).height()! - 200);
      }
    });
    $(window).trigger("resize");
  }
}
