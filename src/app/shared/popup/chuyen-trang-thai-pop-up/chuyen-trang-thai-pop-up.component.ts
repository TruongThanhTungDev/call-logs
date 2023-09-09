import { HttpResponse } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { NotificationService } from "app/notification.service";
import DateUtil from "app/shared/util/date.util";
import { jqxGridComponent } from "jqwidgets-ng/jqxgrid";
import { HttpClient } from "@angular/common/http";
import moment from "moment";
import { CreateOrderGHSVPopUpComponent } from "../create-order-ghsv-pop-up/create-order-ghsv-pop-up.component";
import { LocalStorageService } from "ngx-webstorage";

@Component({
  selector: "chuyen-trang-thai-pop-up",
  templateUrl: "./chuyen-trang-thai-pop-up.component.html",
  styleUrls: ["./chuyen-trang-thai-pop-up.component.scss"],
})
export class ChuyenTrangThaiPopUpComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild("gridReferenceABC") myGrid: jqxGridComponent;
  REQUEST_WORK_URL = "/api/v1/work";
  @Input() data: any;
  // listUser:Observable<object[]>;
  listUser = [];
  selectedStaff: any;
  REQUEST_DATA_URL = "/api/v1/data";
  status = 1;

  /* Order GHSV
   **
   **
   **
   */

  domainGHSV: string = "https://provinces.open-api.vn/api/";

  addressOrder: any = {
    province: "",
    distric: "",
    ward: "",
  };
  info: any;
  provinces: any[];
  districst: any[];
  wards: any[];

  constructor(
    private activeModal: NgbActiveModal,
    private service: DanhMucService,
    private modalService: NgbModal,
    private notificationService: NotificationService,
    private http: HttpClient,
    private localStorage: LocalStorageService
  ) {
    this.info = this.localStorage.retrieve("authenticationToken");
  }

  ngOnInit(): void {
    this.getUserActive();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}
  get isHideOption() {
    return this.info.role === "admin" || this.info.role === "user";
  }
  public getUserActive() {
    this.service
      .getOption(null, this.REQUEST_WORK_URL, "/getAllActive")
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
    this.data.forEach((unitItem) => {
      unitItem.dateChanged = moment(new Date()).format("YYYYMMDDHHmmss");
      unitItem.dateChangedOnly = moment(new Date()).format("YYYYMMDD");
      unitItem.status = this.status;
      if (Number(unitItem.status) === 6) unitItem.price = 0;
    });

    const list = [];
    this.data.forEach((element) => {
      list.push(element.id);
    });

    const entity = {
      dataList: list,
      status: this.status,
    };
    this.service
      .postOption(entity, this.REQUEST_DATA_URL, "/updateStatusDataList")
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
