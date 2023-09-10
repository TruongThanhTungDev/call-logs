import { HttpResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { NotificationService } from "app/notification.service";
import DateUtil from "app/shared/util/date.util";
import moment from "moment";
import { LocalStorageService } from "ngx-webstorage";

@Component({
  selector: "jhi-checkout",
  templateUrl: "./checkin.component.html",
})
export class CheckInComponent implements OnInit {
  checkOut = moment(new Date()).format("YYYYMMDDHHmmss");
  local: LocalStorageService;
  data: any = {};
  shopCode = "";
  shopList: any;
  line = 0;
  lineList: [];
  ACCOUNT_URL = "/api/v1/account";
  REQUEST_URL = "/api/v1/work";
  time: any;
  constructor(
    private activeModal: NgbActiveModal,
    private dmService: DanhMucService,
    private localStorage: LocalStorageService,
    private notificationService: NotificationService
  ) {
    this.local = localStorage;
  }

  ngOnInit(): void {
    moment.locale("vi");
    this.time = moment(new Date()).format("DD/MM/YYYY HH:mm:ss");
  }

  doCheckIn() {
    moment.locale("vi");
    this.dmService.post(this.REQUEST_URL, "/checkin").subscribe(
      (res: any) => {
        if (res.statusCode === 200) {
          this.notificationService.showSuccess(
            "Check In thành công",
            "Thông báo!"
          );
          this.local.store("check_work_active", true);
          this.local.store("call_info", res.result);
          // this.getActiveCall();
          this.activeModal.close(true);
        } else {
          this.notificationService.showError(
            "Có lỗi xảy ra, vui lòng thử lại sau",
            "Thông báo!"
          );
        }
      },
      () => {
        console.error();
      }
    );
  }

  save(): void {
    this.doCheckIn();
  }

  // public valid() {
  //   if (this.line == 0 && this.lineList.length > 0) {
  //     this.notificationService.showError(
  //       "Không được để trống line khi vẫn còn line có thể chọn!",
  //       "error"
  //     );
  //     return false;
  //   }
  //   return true;
  // }

  public dismiss(): void {
    this.activeModal.close(false);
  }
}
