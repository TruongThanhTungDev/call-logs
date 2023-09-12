import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { NotificationService } from "app/notification.service";
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from "ngx-webstorage";
import readXlsxFile from "read-excel-file";
@Component({
  selector: "import-data",
  templateUrl: "./import-data.component.html",
  styleUrls: ["./import-data.component.scss"],
})
export class ImportDataPopup implements OnInit {
  listDepartment: any[] = [];
  listData: any[] = [];
  deparmentSelected: any;
  selectedFile: any;
  DEPARTMENT_URL = "/api/v1/department";
  UPLOAD_FILE_URL = "/api/v1/uploadFile/data";
  constructor(
    private activeModal: NgbActiveModal,
    private dmService: DanhMucService,
    private localStorage: LocalStorageService,
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    private http: HttpClient
  ) {}
  ngOnInit(): void {
    this.loadData();
  }
  public dismiss(): void {
    this.activeModal.close(false);
  }
  public decline(): void {
    this.activeModal.close(false);
  }

  public accept(): void {
    this.activeModal.close(true);
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
  selectFile(event) {
    this.selectedFile = event.target.files[0];
    readXlsxFile(this.selectedFile).then((result: any) => {
      this.listData = result.slice(1).map((item: any) => ({
        id: item[0],
        name: item[1],
        phone: item[2],
        address: item[3],
      }));
    });
  }
  saveUploadFile() {
    if (!this.selectedFile) {
      this.notificationService.showWarning("Vui lòng chọn file!", "Cảnh báo");
      return;
    }
    if (!this.deparmentSelected) {
      this.notificationService.showWarning(
        "Vui lòng chọn Phòng ban!",
        "Cảnh báo"
      );
      return;
    }
    const formData = new FormData();
    formData.append("file", this.selectedFile);
    this.spinner.show();
    this.dmService
      .uploadFile(
        this.UPLOAD_FILE_URL + `?departmentId=${this.deparmentSelected.id}`,
        formData
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            this.spinner.hide();
            this.notificationService.showSuccess(
              "Nhập dữ liệu thành công",
              "Thông báo"
            );
            this.accept();
          } else {
            this.spinner.hide();
            this.notificationService.showError(
              "Nhập dữ liệu thất bại",
              "Thông báo"
            );
          }
        },
        () => {
          this.spinner.hide();
          this.notificationService.showError(
            "Có lỗi xảy ra, vui lòng thử lại",
            "Thông báo"
          );
        }
      );
  }
}
