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
export class GiaoViecPopUpComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  REQUEST_WORK_URL = "/api/v1/work";
  @Input() data: any;
  @Input() shopCode: any;
  // listUser:Observable<object[]>;
  listUser = [];
  selectedStaff: any;
  REQUEST_DATA_URL = "/api/v1/data";

  constructor(
    private activeModal: NgbActiveModal,
    private service: DanhMucService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getUserActive();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  public getUserActive() {
    if (!this.shopCode) return;
    this.service
      .getOption(
        null,
        this.REQUEST_WORK_URL,
        "/getAllActive?shopCode=" + this.shopCode
      )
      .subscribe(
        (res: HttpResponse<any>) => {
          this.listUser = res.body.RESULT;
        },
        (error: any) => {
          this.notificationService.showError(
            `${error.body.RESULT.message}`,
            "Thông báo lỗi!"
          );
        }
      );
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
      dataList: this.data.map((item) => {
        return {
          ...item,
          nhanVienId: this.selectedStaff,
          dateChanged: moment(new Date()).format("YYYYMMDDHHmmss"),
          dateChangedOnly: moment(new Date()).format("YYYYMMDD"),
          status: item.status === 0 ? 1 : item.status,
        };
      }),
    };
    this.service
      .postOption(entity, this.REQUEST_DATA_URL, "/assignWork")
      .subscribe(
        (res: HttpResponse<any>) => {
          this.activeModal.close();
          this.notificationService.showSuccess(
            `${res.body.MESSAGE}`,
            "Thông báo!"
          );
        },
        (error: any) => {
          this.notificationService.showError(
            `${error.body.MESSAGE}`,
            "Thông báo lỗi!"
          );
        }
      );
  }
}
