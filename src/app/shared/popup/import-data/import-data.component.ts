import { HttpResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { NotificationService } from "app/notification.service";
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from "ngx-webstorage";

@Component({
  selector: "import-data",
  templateUrl: "./import-data.component.html",
  styleUrls: ["./import-data.component.scss"],
})
export class ImportDataPopup implements OnInit {
  listDepartment: any[] = [];
  deparmentSelected: any;
  DEPARTMENT_URL = "/api/v1/department";
  constructor(
    private activeModal: NgbActiveModal,
    private dmService: DanhMucService,
    private localStorage: LocalStorageService,
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService
  ) {}
  ngOnInit(): void {
    this.loadData();
  }
  public dismiss(): void {
    this.activeModal.close(false);
  }
  public filterData() {
    const filter = [];
    filter.push("id>0");
    return filter.join(";");
  }
  loadData() {
    const payload = {
      page: 0,
      size: 9999,
      filter: "id>0",
      sort: ["id", "asc"],
    };
    this.spinner.show();
    this.dmService.query(payload, this.DEPARTMENT_URL).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body.statusCode === 200) {
          this.spinner.hide();
          this.listDepartment = res.body.result.content;
        } else {
          this.spinner.hide();
          this.notificationService.showError(
            "Lấy danh sách phòng ban thất bại",
            "Fail"
          );
        }
      },
      () => {
        this.spinner.hide();
        this.notificationService.showError("Đã có lỗi xảy ra", "Fail");
        console.error();
      }
    );
  }
}
