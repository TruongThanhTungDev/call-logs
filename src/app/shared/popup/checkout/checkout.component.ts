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
  templateUrl: "./checkout.component.html",
  styleUrls: ["./checkout.component.scss"],
})
export class CheckOutComponent implements OnInit {
  checkOut = moment(new Date()).format("YYYYMMDDHHmmss");
  local: LocalStorageService;
  data: any = {};
  REQUEST_URL = "/api/v1/work/infoCheckout";
  constructor(
    private activeModal: NgbActiveModal,
    private dmService: DanhMucService,
    private localStorage: LocalStorageService,
    private notificationService: NotificationService
  ) {
    this.local = localStorage;
  }

  ngOnInit(): void {
    this.getInfo();
  }

  getInfo(): void {
    const token = this.localStorage.retrieve("authenticationtoken");
    this.dmService
      .postOption({ nhanVienId: token.id }, "/api/v1/work/checkWorkActive", "")
      .subscribe(
        (res: HttpResponse<any>) => {
          if (res.body.CODE === 200) {
            this.data = res.body.RESULT;
            if (this.data) {
              this.data.timeIn = this.data.timeIn
                ? DateUtil.formatDate(this.data.timeIn)
                : null;
              this.checkOut = this.checkOut
                ? DateUtil.formatDate(this.checkOut)
                : null;
            }
          }
        },
        () => {
          this.notificationService.showError(
            "Đã có lỗi xảy ra",
            "Thông báo lỗi!"
          );
        }
      );
    // this.dmService.postOption(null,this.REQUEST_URL, "?id=" + token.id).subscribe(
    //   (res: HttpResponse<any>) => {
    //     this.data = this.customDate(res.body.RESULT);
    //   },
    //   (error: any) => {
    //     this.notificationService.showError('Đã có lỗi xảy ra',"Thông báo lỗi!");
    //   }
    // );
  }
  doCheckOut() {
    let time = moment(new Date()).format("YYYYMMDDHHmmss");
    let checkOutEntity = {
      id: this.data.id,
      timeOut: time,
      totalOrder: this.data.totalOrder,
      successOrder: this.data.successOrder,
      processedOrder: this.data.processedOrder,
      onlyOrder: this.data.onlyOrder,
      processedOnlyOrder: this.data.processedOnlyOrder,
    };

    this.dmService
      .postOption(checkOutEntity, "/api/v1/work/checkOut/", "")
      .subscribe(
        (res: HttpResponse<any>) => {
          if (res.body.CODE === 200) {
            this.notificationService.showSuccess(
              "Check Out thành công",
              "Thông báo!"
            );
            this.local.store("check_work_active", false);
            this.local.store("shopcode", "");
            this.activeCall();
            this.activeModal.close(true);
          } else {
            this.notificationService.showError(
              "Đã có lỗi xảy ra",
              "Thông báo!"
            );
          }
        },
        () => {
          console.error();
        }
      );
  }

  activeCall(): void {
    const callInfo = this.localStorage.retrieve("callInfo");
    if (callInfo) {
      this.dmService
        .getOption(null, "/api/v1/call/active?id=" + callInfo.id, "")
        .subscribe(
          (res: HttpResponse<any>) => {
            if (res.body.CODE === 200) {
              this.localStorage.clear("callInfo");
              this.notificationService.showSuccess(
                "Đóng ext call thành công",
                "Thông báo!"
              );
            }
          },
          () => {
            console.error();
          }
        );
    }
  }

  save(): void {
    this.doCheckOut();
  }

  public dismiss(): void {
    this.activeModal.close(false);
  }
}
