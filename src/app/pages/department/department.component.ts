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
  selectedEntity: any;
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
  data: any[] = [];
  totalItems = 0;
  page = 0;
  itemsPerPage = 0;
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

  loadData() {
    const payload = {
      search: this.deparmentName ? this.deparmentName : "",
    };
    this.dmService.getOption(payload, this.REQUEST_URL, "/search").subscribe(
      (res: HttpResponse<any>) => {
        console.log("res :>> ", res);
      },
      () => {}
    );
  }
  loadPage(page: any) {}

  editDepartment(department: any) {
    const modalRef = this.modalService.open(DepartmentPopup, {
      size: "lg",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.data = this.selectedEntity;
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
          this.dmService
            .delete(id, this.REQUEST_URL + OPERATIONS.DELETE)
            .subscribe(
              (res: HttpResponse<any>) => {
                if (res.body.CODE === 200) {
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
      this.data.splice(index, 1);
    } else {
      this.data.push(item);
    }
  }
}
