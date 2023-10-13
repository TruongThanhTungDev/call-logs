import { HttpResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OPERATIONS } from "app/app.constants";
import { DanhMucService } from "app/danhmuc.service";
import { ConfirmDialogComponent } from "app/layouts/confirm-dialog/confirm-dialog.component";
import { ConfirmationDialogService } from "app/layouts/confirm-dialog/confirm-dialog.service";
import { NotificationService } from "app/notification.service";
import { DepartmentPopup } from "app/shared/popup/them-sua-xoa-department/them-sua-xoa-department.component";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "department-cmp",
  templateUrl: "./department.component.html",
})
export class DepartmentComponent implements OnInit {
  REQUEST_URL = "/api/v1/department";
  deparmentName: "";
  itemsPerPage = 10;
  page = 1;
  sort = "id";
  totalItems = 0;
  previousPage = 1;
  listEntity = [];
  sortType = true;
  selectedEntity: any;
  listSelected: any[] = [];
  fields: any[] = [
    {
      label: "Mã phòng ban",
      key: "code",
      class: "",
      style: "width: 15%",
    },
    {
      label: "Tên phòng ban",
      key: "name",
      class: "",
      style: "width: 45%",
    },
    {
      label: "Trạng thái",
      key: "status",
      class: "",
      style: "width: 15%",
    },
    {
      label: "Ghi chú",
      key: "note",
      class: "",
      style: "width: 25%",
    },
  ];
  data = [];
  params = {
    page: 1,
    itemsPerPage: 10,
    name: "",
    code: "",
    status: "",
  };
  constructor(
    private dmService: DanhMucService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private confirmDialogService: ConfirmationDialogService
  ) {}
  ngOnInit(): void {
    this.loadData();
  }
  public filterData() {
    const filter = [];
    this.params.page = 1;
    filter.push("id>0");
    if (this.params.name) {
      filter.push(`name=="*${this.params.name.trim()}*"`);
    }
    if (this.params.status) {
      filter.push(`status==${this.params.status}`);
    }
    if (this.params.code) {
      filter.push(`code=="*${this.params.code.trim()}*"`);
    }

    return filter.join(";");
  }
  loadData() {
    const payload = {
      sort: [this.sort, this.sortType ? "desc" : "asc"],
      page: this.page - 1,
      size: this.itemsPerPage,
      filter: this.filterData(),
    };
     this.spinner.show();
    this.dmService.query(payload, this.REQUEST_URL).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body.statusCode === 200) {
          this.spinner.hide();
          this.page = res.body ? res.body.result.number + 1 : 1;
          this.totalItems = res.body ? res.body.result.totalElements : 0;
          this.data = res.body.result.content;
          if (this.data.length === 0 && this.page > 1) {
            this.page = 1;
            this.loadData();
          }
        } else {
          this.spinner.hide();
          this.notificationService.showError(res.body.MESSAGE, "Fail");
        }
      },
      () => {
        this.notificationService.showError("Đã có lỗi xảy ra", "Fail");
        console.error();
      }
    );
  }
  loadPage(page: number): void {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.loadData();
    }
  }

  editDepartment(department: any) {
    this.selectedEntity = department;
    const modalRef = this.modalService.open(DepartmentPopup, {
      size: "lg",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.data = department;
    modalRef.componentInstance.type = "edit";
    modalRef.componentInstance.title = "Xử lý thông tin phòng ban";
    modalRef.result.then(
      () => {
        this.loadData();
      },
      () => {}
    );
  }
  createDepartment() {
    const modalRef = this.modalService.open(DepartmentPopup, {
      size: "lg",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.data = null;
    modalRef.componentInstance.type = "add";
    modalRef.componentInstance.title = "Tạo mới Phòng ban";
    modalRef.result.then(
      () => {
        this.loadData();
      },
      () => {}
    );
  }
  handleDeleteEDepartment(id: any) {
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
  selectRow(item: any) {
    const index = this.data.findIndex((el: any) => el.id === item.id);
    if (index !== -1) {
      this.listSelected.splice(index, 1);
      this.selectedEntity = item;
    } else {
      this.listSelected.push(item);
      this.selectedEntity = null;
    }
  }
  reset() {
    this.selectedEntity = "";
    this.loadData();
  }

  selectItem(department: any) {
    if (this.selectedEntity && department.id === this.selectedEntity.id) {
      this.selectedEntity = null;
    } else {
      this.selectedEntity = department;
    }
  }
}
