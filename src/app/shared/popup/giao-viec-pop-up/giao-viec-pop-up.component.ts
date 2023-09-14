import { HttpResponse } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { NotificationService } from "app/notification.service";
import DateUtil from "app/shared/util/date.util";
import moment from "moment";

@Component({
  selector: "app-giao-viec-pop-up",
  templateUrl: "./giao-viec-pop-up.component.html",
  styleUrls: ["./giao-viec-pop-up.component.scss"],
})
export class GiaoViecPopUpComponent implements OnInit {
  REQUEST_WORK_URL = "/api/v1/work";
  @Input() data: any;
  @Input() shopCode: any;
  // listUser:Observable<object[]>;
  listUser = [];
  selectedStaff: any;
  REQUEST_DATA_URL = "/api/v1/data";
  infoUser: any;
  constructor(
    private activeModal: NgbActiveModal,
    private service: DanhMucService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {
    this.infoUser = JSON.parse(localStorage.getItem("authenticationtoken"));
  }

  ngOnInit(): void {
    this.getUserActive();
  }
  getUserActive() {
    const params = {
      sort: ["id", "asc"],
      page: 0,
      size: 9999,
      filter: this.filter(),
    };
    this.service.query(params, this.REQUEST_WORK_URL).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body.statusCode === 200) {
          this.listUser = res.body.result.content;
        } else {
          this.notificationService.showError(res.body.MESSAGE, "Error message");
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
    comparesArray.push(
      `isActive==1;staff.department.id==${this.infoUser.departmentId}`
    );
    return comparesArray.join(";");
  }
  customDate(list: any[]): any[] {
    list.forEach((unitItem) => {
      unitItem.ngay = unitItem.date ? DateUtil.formatDate(unitItem.date) : null;
    });
    return list;
  }

  public dismiss(): void {
    this.activeModal.dismiss();
  }

  public assignWork(): void {
    if (!this.selectedStaff) {
      this.notificationService.showWarning(
        "Vui lòng chọn nhân sự",
        "Cảnh báo!"
      );
      return;
    }
    const entity = {
      item: this.data.map((item) => {
        return {
          userId: this.selectedStaff,
          dataId: item.id,
        };
      }),
    };
    this.service
      .postOption(entity, this.REQUEST_DATA_URL, "/assignData")
      .subscribe(
        (res: HttpResponse<any>) => {
          this.activeModal.close();
          this.notificationService.showSuccess(
            `Giao việc thành công`,
            "Thông báo!"
          );
        },
        (error: any) => {
          this.notificationService.showError(
            `Giao việc thất bại`,
            "Thông báo lỗi!"
          );
        }
      );
  }
}
