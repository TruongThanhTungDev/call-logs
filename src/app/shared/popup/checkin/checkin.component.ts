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
  SHOP_URL = "/api/v1/shop";
  REQUEST_URL = "/api/v1/work/";
  CALL_URL = "/api/v1/call/";
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
    this.time = moment(new Date()).format("YYYYMMDDHHmmss");
    this.loadShopList();
    this.loadLineList();
  }
  public loadShopList() {
    this.dmService
      .getOption(
        null,
        this.ACCOUNT_URL,
        "/details?id=" + this.local.retrieve("authenticationToken").id
      )
      .subscribe((res: HttpResponse<any>) => {
        this.dmService
          .getOption(
            null,
            this.SHOP_URL,
            "/search?filter=id>0;status==1;code=in=(" +
              res.body.RESULT.shop +
              ")&sort=id,asc&size=1000&page=0"
          )
          .subscribe(
            (res: HttpResponse<any>) => {
              this.shopList = res.body.RESULT.content;
              this.shopCode = this.shopList[0].code;
            },
            () => {
              console.error();
            }
          );
      });
  }

  public loadLineList() {
    this.line = 0;
    this.dmService
      .getOption(
        null,
        this.CALL_URL,
        "search?filter=id>0;isActive==1;account==%23NULL%23&sort=id,asc&size=10000&page=0"
      )
      .subscribe(
        (res: HttpResponse<any>) => {
          this.lineList = res.body.RESULT.content;
        },
        () => {
          console.error();
        }
      );
  }
  doCheckIn() {
    moment.locale("vi");
    let checkInEntity = {
      timeIn: this.time,
      nhanVienId: this.local.retrieve("authenticationToken").id,
      shopCode: this.shopCode,
      line: this.line,
    };
    console.log(checkInEntity);
    if (this.valid()) {
      this.dmService.postOption(checkInEntity, this.REQUEST_URL, "").subscribe(
        (res: HttpResponse<any>) => {
          if (res.body.CODE === 200) {
            this.notificationService.showSuccess(
              "Check In thành công",
              "Thông báo!"
            );
            this.local.store("check_work_active", true);
            this.local.store("shopcode", this.shopCode);
            this.local.store("call_info", res.body.RESULT.callInfo);
            // this.getActiveCall();
            this.activeModal.close(true);
          } else {
            this.notificationService.showError(res.body.MESSAGE, "Thông báo!");
            this.loadLineList();
          }
        },
        () => {
          console.error();
        }
      );
    }
  }

  // getActiveCall() {
  //   this.dmService.getOption(null, "/api/v1/call/get-active", '').subscribe(
  //     (res: HttpResponse<any>) => {
  //       if (res.body.CODE === 200) {
  //         this.local.store('callInfo', res.body.RESULT);
  //         this.local.store('check_work_active', true);
  //         this.notificationService.showSuccess('Success!', "Có thể kết nối đến line" + res.body.RESULT.code);
  //       } else {
  //         this.notificationService.showWarning("Warning!", res.body.RESULT);
  //       }
  //       // window.location.reload();
  //     },
  //     () => {
  //       console.error();
  //     }
  //   );
  // }

  save(): void {
    if (this.shopCode == "") {
      this.notificationService.showError(
        "shop code không được để trống!",
        "Fail"
      );
      return;
    }
    if (this.line == 0 && this.lineList.length > 0) {
      this.notificationService;
    }
    this.doCheckIn();
  }

  public valid() {
    if (this.line == 0 && this.lineList.length > 0) {
      this.notificationService.showError(
        "Không được để trống line khi vẫn còn line có thể chọn!",
        "error"
      );
      return false;
    }
    return true;
  }

  public dismiss(): void {
    this.activeModal.close(false);
  }
}
