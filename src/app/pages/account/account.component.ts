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
  REQUEST_URL = "/api/v1/account";

  listEntity = [];
  info: any;
  selectedEntity: any = null;
  selectedId = 0;

  FtTaiKhoan = "";
  FtHoTen = "";
  FtEmail = "";
  FtSdt = "";
  FtDiaChi = "";
  FtPhanQuyen = "";
  FtGhiChu = "";
  shopCode = "";

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
    this.route.queryParams.subscribe((params) => {
      this.shopCode = params.shopCode;
    });
  }

  ngOnInit() {
    // if(this.shopCode){
    this.loadData();
    // }
    this.scriptPage();
  }
  ngAfterViewInit(): void {}
  public loadData() {
    if (this.info.role !== "admin") return;
    const params = {
      sort: [this.sort, this.sortType ? "desc" : "asc"],
      page: this.page - 1,
      size: this.itemsPerPage,
      filter: this.filter(),
    };
    this.dmService.query(params, this.REQUEST_URL).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body) {
          if (res.body.CODE === 200) {
            this.page = res.body ? res.body.RESULT.number + 1 : 1;
            this.totalItems = res.body ? res.body.RESULT.totalElements : 0;
            this.listEntity = res.body.RESULT.content;
            // load page
            if (this.listEntity.length === 0 && this.page > 1) {
              this.page = 1;
              this.loadData();
            }
          } else {
            this.notificationService.showError(
              res.body.MESSAGE,
              "Error message"
            );
          }
        } else {
          this.notificationService.showError(
            "Đã có lỗi xảy ra",
            "Error message"
          );
        }
      },
      () => {
        this.notificationService.showError("Đã có lỗi xảy ra", "Error message");
        console.error();
      }
    );
  }

  private filter(): string {
    const comparesArray: string[] = [];
    const {
      FtTaiKhoan,
      FtHoTen,
      FtDiaChi,
      FtEmail,
      FtGhiChu,
      FtPhanQuyen,
      FtSdt,
      shopCode,
    } = this;
    comparesArray.push(`id>0`);
    if (FtHoTen) comparesArray.push(`fullName=="*${FtHoTen.trim()}*"`);
    if (FtTaiKhoan) comparesArray.push(`userName=="*${FtTaiKhoan.trim()}*"`);
    if (FtDiaChi) comparesArray.push(`address=="*${FtDiaChi.trim()}*"`);
    if (FtEmail) comparesArray.push(`email=="*${FtEmail.trim()}*"`);
    if (FtGhiChu) comparesArray.push(`note=="*${FtGhiChu.trim()}*"`);
    if (FtPhanQuyen) comparesArray.push(`role=="*${FtPhanQuyen.trim()}*"`);
    if (FtSdt) comparesArray.push(`phone=="*${FtSdt.trim()}*"`);
    return comparesArray.join(";");
  }

  filterPhanQuyen(e: any): void {
    this.FtPhanQuyen = e;
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
  public updateData() {
    if (!this.selectedEntity) {
      this.notificationService.showWarning(
        "Vui lòng chọn dữ liệu",
        "Cảnh báo!"
      );
      return;
    }
    const modalRef = this.modalService.open(ThemSuaXoaAccountComponent, {
      size: "lg",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.data = this.selectedEntity;
    modalRef.componentInstance.title = "Xử lý thông tin tài khoản";
    modalRef.result.then(
      () => {
        this.loadData();
      },
      () => {}
    );
  }
  public createData() {
    const modalRef = this.modalService.open(ThemSuaXoaAccountComponent, {
      size: "lg",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.data = null;
    modalRef.componentInstance.title = "Tạo tài khoản";
    modalRef.result.then(
      () => {
        this.loadData();
      },
      () => {}
    );
  }
  public deleteData() {
    if (!this.selectedEntity) {
      this.notificationService.showWarning(
        "Vui lòng chọn dữ liệu",
        "Cảnh báo!"
      );
      return;
    }
    this.confirmDialogService
      .confirm("Bạn có thật sự muốn xóa bản ghi này?", "Đồng ý", "Hủy")
      .then((confirmed: any) => {
        if (confirmed) {
          this.dmService
            .delete(
              this.selectedEntity.id,
              this.REQUEST_URL + OPERATIONS.DELETE
            )
            .subscribe(
              (res: HttpResponse<any>) => {
                if (res.body.CODE === 200) {
                  this.notificationService.showSuccess(
                    "Xóa thành công",
                    "Success"
                  );
                  setTimeout(() => {
                    this.loadData();
                  }, 100);
                } else {
                  this.notificationService.showError("Xóa thất bại", "Fail");
                }
              },
              () => {
                console.error();
              }
            );
        }
      })
      .catch(() =>
        console.log(
          "User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)"
        )
      );
  }
  public onRowSelect(event: any): void {
    this.selectedEntity = event;
    this.selectedId = event.id;
  }
  public onRowdblclick(event: any): void {
    this.selectedEntity = event;
    this.updateData();
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
