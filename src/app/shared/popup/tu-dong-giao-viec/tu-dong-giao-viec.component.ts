import { HttpResponse } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { NotificationService } from "app/notification.service";
import { CheckBoxUtil } from "app/shared/util/checkbox-util";
import DateUtil from "app/shared/util/date.util";
import { jqxGridComponent } from "jqwidgets-ng/jqxgrid";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: "app-tu-dong-giao-viec",
  templateUrl: "./tu-dong-giao-viec.component.html",
  styleUrls: ["./tu-dong-giao-viec.component.scss"],
})
export class TuDongGiaoViecComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild("gridCongViec") myGridCV: jqxGridComponent;
  @Input() shopCode: any;
  REQUEST_WORK_URL = "/api/v1/work";
  listUser = [];
  listWork = [];
  selectId = null;
  REQUEST_DATA_URL = "/api/v1/data";
  REQUEST_USER = "/api/v1/user";
  numOfWork = 0;
  infoUser: any;
  departmentInfo: any;
  // chung
  ftTenDangNhap = "";
  ftHoTen = "";
  // checkbox
  listCheck: any[] = [];
  checkBoxValues: boolean[] = Array(1000).fill(false);
  checkBoxUtil = new CheckBoxUtil();
  checkAllValues = false;
  constructor(
    private activeModal: NgbActiveModal,
    private service: DanhMucService,
    private notificationService: NotificationService,
    private spinnerService: NgxSpinnerService,
    private spinner: NgxSpinnerService
  ) {
    this.infoUser = JSON.parse(localStorage.getItem("authenticationtoken"));
  }

  ngOnInit(): void {
    this.getWorks();
  }

  ngOnDestroy(): void {}

  ngAfterViewInit(): void {}

  getUserActive(e: any) {
    const params = {
      sort: ["id", "asc"],
      page: 0,
      size: 1000,
      filter: this.filter(),
    };
    this.service.query(params, this.REQUEST_WORK_URL).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body) {
          if (res.body.statusCode === 200) {
            this.listUser = res.body.result.content;
            if (e) {
              this.checkAllValues = true;
              this.checkAll();
            } else {
              // checkbox
              this.checkBoxValues = this.checkBoxUtil.getPageCheckArray(
                this.listUser
              );
              if (
                this.listUser.length ===
                  this.checkBoxValues.filter((k) => k === true).length &&
                this.listUser.length !== 0
              ) {
                this.checkAllValues = true;
              } else {
                this.checkAllValues = false;
              }
            }

            this.customDataSelect(this.listUser);
          } else {
            this.notificationService.showError(
              res.body.MESSAGE,
              "Error message"
            );
          }
        } else {
          this.notificationService.showError(
            "Đã có lỗi xảy ra",
            "Error message"
          );
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
    const { ftHoTen, ftTenDangNhap } = this;
    comparesArray.push(
      `isActive==1;staff.department.id==${this.infoUser.departmentId}`
    );
    if (ftHoTen) comparesArray.push(`account.fullName == "*${ftHoTen}*" `);
    if (ftTenDangNhap)
      comparesArray.push(`account.userName == "*${ftTenDangNhap}*" `);
    return comparesArray.join(";");
  }

  checkOnIndex(i: number): void {
    if (this.checkBoxValues[i]) {
      this.listCheck = this.checkBoxUtil.addToCheckList(this.listUser[i]);
    } else {
      this.listCheck = this.checkBoxUtil.removeFromCheckList(this.listUser[i]);
      this.checkAllValues = false;
    }
    if (
      this.listUser.length ===
      this.checkBoxValues.filter((k) => k === true).length
    ) {
      this.checkAllValues = true;
    }
    this.listUser = this.customDataSelect(this.listUser);
  }

  checkAll(): void {
    if (this.checkAllValues) {
      for (let i = 0; i < this.listUser.length; i++) {
        this.checkBoxValues[i] = true;
        this.listCheck = this.checkBoxUtil.addToCheckList(this.listUser[i]);
      }
    } else {
      for (let i = 0; i < this.listUser.length; i++) {
        this.checkBoxValues[i] = false;
        this.listCheck = this.checkBoxUtil.removeFromCheckList(
          this.listUser[i]
        );
      }
    }
    this.listUser = this.customDataSelect(this.listUser);
  }

  customDataSelect(list: any[]): any[] {
    const count = this.listCheck.length;
    const listcheck = [];
    for (let i = 0; i < this.listCheck.length; i++) {
      listcheck.push(this.listCheck[i].id);
    }
    const listWorkAssign = this.listWork.slice(0, this.numOfWork);

    const phanDu = listWorkAssign.length % count;
    const phanNguyen = Math.floor(listWorkAssign.length / count);
    if (listWorkAssign.length >= count) {
      if (phanDu === 0) {
        list.forEach((unitItem, index) => {
          unitItem.ten = unitItem.account ? unitItem.account.userName : null;
          unitItem.tenDayDu = unitItem.account
            ? unitItem.account.fullName
            : null;
          unitItem.thoiGianVao = unitItem.timeIn
            ? DateUtil.formatDate(unitItem.timeIn)
            : null;
          unitItem.soLuongCV = listcheck.includes(unitItem.id)
            ? phanNguyen
            : null;
        });
        return list;
      } else {
        let countListCheck = count;
        list.forEach((unitItem, index) => {
          unitItem.ten = unitItem.account ? unitItem.account.userName : null;
          unitItem.tenDayDu = unitItem.acvount
            ? unitItem.account.fullName
            : null;
          unitItem.thoiGianVao = unitItem.timeIn
            ? DateUtil.formatDate(unitItem.timeIn)
            : null;
          if (listcheck.includes(unitItem.id)) {
            countListCheck--;
            unitItem.soLuongCV =
              countListCheck === 0 ? phanNguyen + phanDu : phanNguyen;
          } else {
            unitItem.soLuongCV = null;
          }
        });
        return list;
      }
    } else {
      let countListCheck = count;
      list.forEach((unitItem, index) => {
        unitItem.ten = unitItem.account ? unitItem.account.userName : null;
        unitItem.tenDayDu = unitItem.account ? unitItem.account.fullName : null;
        unitItem.thoiGianVao = unitItem.timeIn
          ? DateUtil.formatDate(unitItem.timeIn)
          : null;
        if (listcheck.includes(unitItem.id)) {
          countListCheck--;
          if (countListCheck === 0) {
            unitItem.soLuongCV = phanDu;
          } else {
            unitItem.soLuongCV = 0;
          }
        } else {
          unitItem.soLuongCV = null;
        }
      });
      return list;
    }
  }
  filterWork() {
    const filter = [];
    filter.push(`id>0;staff==#NULL#`);
    if (this.infoUser.roleList.includes("leader")) {
      filter.push(`department.id==${this.infoUser.departmentId}`);
    }
    if (this.infoUser.roleList.includes("staff")) {
      filter.push(
        `department.id==${this.infoUser.departmentId};staff.id==${this.infoUser.staffId}`
      );
    }
    return filter.join(";");
  }
  getWorks(): void {
    const params = {
      sort: ["id", "desc"],
      page: 0,
      size: 9999,
      filter: this.filterWork(),
    };
    this.spinner.show();
    this.service.query(params, this.REQUEST_DATA_URL).subscribe(
      (res: HttpResponse<any>) => {
        this.listWork = res.body.result.content;
        this.listWork = this.listWork.sort((a, b) => 0.5 - Math.random());
        this.numOfWork = this.listWork.length;
        if (this.listWork.length === 0) {
          this.notificationService.showWarning(
            "Danh sách công việc trống",
            "Cảnh báo!"
          );
          this.spinner.hide();
        } else {
          this.getUserActive("all");
        }
        this.spinner.hide();
      },
      (error: HttpResponse<any>) => {
        this.notificationService.showError(
          `${error.body.RESULT.message}`,
          "Thông báo lỗi!"
        );
        this.spinner.hide();
      },
      () => {
        this.spinner.hide();
      }
    );
  }
  onChangeNumOfWork(): void {
    if (this.numOfWork > this.listWork.length || this.numOfWork <= 0) {
      this.notificationService.showError("Số lượng không hợp lý!", "Cảnh báo");
      this.numOfWork = this.listWork.length;
    } else {
      this.checkAllValues = true;
      this.checkAll();
    }
  }

  public dismiss(): void {
    this.activeModal.dismiss();
  }

  public assignWork(): void {
    this.spinnerService.show();
    const listCheck = this.listCheck;
    if (listCheck.length === 0) {
      this.notificationService.showWarning(
        "Vui lòng chọn ít nhất một tài khoản",
        "Cảnh báo!"
      );
    }
    let listWorkAssign = this.listWork.slice(0, this.numOfWork);

    const phanNguyen = Math.floor(listWorkAssign.length / listCheck.length);
    const length = listCheck.length;
    let countTK = 0;
    let countCV = phanNguyen;

    if (phanNguyen === 0) {
      listWorkAssign.forEach((unitItem) => {
        unitItem.userId = listCheck[listCheck.length - 1].staff.id;
        unitItem.dataId = unitItem.id;
      });
    } else {
      listWorkAssign.forEach((unitItem, index) => {
        unitItem.userId = listCheck[listCheck.length - 1].staff.id;
        unitItem.dataId = unitItem.id;
        if (index === countCV - 1) {
          countCV = countCV + phanNguyen;
          if (countTK !== length - 1) {
            countTK++;
          }
        }
      });
    }
    listWorkAssign = listWorkAssign.map((item: any) => ({
      userId: listCheck[listCheck.length - 1].staff.id,
      dataId: item.id,
    }));
    this.save(listWorkAssign);
  }
  save(list: any): void {
    const entity = {
      item: list,
    };
    this.service
      .postOption(entity, this.REQUEST_DATA_URL, "/assignData")
      .subscribe(
        (res: HttpResponse<any>) => {
          this.spinnerService.hide();
          this.activeModal.close();
          this.notificationService.showSuccess(
            "Giao việc thành công!",
            "Thông báo!"
          );
        },
        (error: any) => {
          this.spinnerService.hide();
          this.notificationService.showError(
            "Đã có lỗi xảy ra",
            "Thông báo lỗi!"
          );
        }
      );
  }
}
