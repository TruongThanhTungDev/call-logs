import { HttpResponse } from "@angular/common/http";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { NotificationService } from "app/notification.service";
import { CreateOrderGHSVPopUpComponent } from "app/shared/popup/create-order-ghsv-pop-up/create-order-ghsv-pop-up.component";
import { TongKetDuLieuPopupComponent } from "app/shared/popup/tong-ket-du-lieu/TongKetDuLieuPopup.component";
import { TuDongGiaoViecComponent } from "app/shared/popup/tu-dong-giao-viec/tu-dong-giao-viec.component";
import { XuLyDuLieuPopupComponent } from "app/shared/popup/xu-ly-du-lieu/XuLyDuLieuPopup.component";
import DateUtil from "app/shared/util/date.util";
import dayjs from "dayjs/esm";
import { CheckBoxUtil } from "app/shared/util/checkbox-util";
import * as moment from "moment";
import { ExcelService } from "app/shared/util/exportExcel.service";
import {
  DateRanges,
  TimePeriod,
} from "ngx-daterangepicker-material/daterangepicker.component";
import { LocalStorageService } from "ngx-webstorage";
import * as XLSX from "xlsx";
import { GiaoViecPopUpComponent } from "app/shared/popup/giao-viec-pop-up/giao-viec-pop-up.component";
import { NgxSpinnerService } from "ngx-spinner";
import { ChuyenTrangThaiPopUpComponent } from "app/shared/popup/chuyen-trang-thai-pop-up/chuyen-trang-thai-pop-up.component";
import { Plugin } from "app/shared/util/plugins";
import { ImportDataPopup } from "app/shared/popup/import-data/import-data.component";

@Component({
  selector: "data-cmp",
  templateUrl: "data.component.html",
  styleUrls: ["./data.component.scss"],
})
export class DataComponent implements OnInit, AfterViewInit {
  @ViewChild("TABLE", { static: false }) TABLE: ElementRef;
  // chung
  itemsPerPage = 25;
  page = 1;
  totalItems = 0;
  previousPage = 1;
  sort = "id";
  sortType = true;
  REQUEST_URL = "/api/v1/data";
  selectedId: any = null;
  //filter
  revenue: any;
  ftTrangThai: any = "0,1,2,3,4,5,6,9";
  ftThoiGian = "";
  ftKhachHang = "";
  ftSdt = "";
  ftSanPham = "";
  ftNhanVien = "";
  ftDoanhSo = "";
  ftChiPhi = "";
  ftNoteShipping = "";
  ftMaVanChuyen = "";
  ftNguoiVC = "";
  ftTaiKhoanVC = "";
  plugins = new Plugin();
  listEntity = [];
  selectedEntity: any;
  public searchKey = "";
  statusDto: any = "";
  data: any = [];
  orders: any = [];
  // date
  dateRange: TimePeriod = {
    startDate: dayjs(),
    endDate: dayjs(),
  };
  date: object;
  checkSingleSelected = false;
  checkMultiSelected = false;
  ranges: DateRanges = {
    ["Hôm nay"]: [dayjs(), dayjs()],
    ["Hôm qua"]: [dayjs().subtract(1, "days"), dayjs().subtract(1, "days")],
    ["7 Ngày qua"]: [dayjs().subtract(6, "days"), dayjs()],
    ["30 Ngày qua"]: [dayjs().subtract(29, "days"), dayjs()],
    ["Tháng này"]: [dayjs().startOf("month"), dayjs().endOf("month")],
    ["Tháng trước"]: [
      dayjs().subtract(1, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month"),
    ],
    ["3 Tháng trước"]: [
      dayjs().subtract(3, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month"),
    ],
  };

  info: any;
  countXuLy = 0;
  checkStatusActive = false;
  checkSuccessActive = true;
  countList = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  countGiaoHang = 0;
  shopCode = "";
  tongDoanhSo = 0;
  tongDon = 0;
  // checkbox
  listCheck: any[] = [];
  checkBoxValues: boolean[] = Array(this.itemsPerPage).fill(false);
  checkBoxUtil = new CheckBoxUtil();
  checkAllValues = false;
  REQUEST_CREATE_ORDER_URL = "/api/v1/order-shipping";
  province: any;
  district: any;
  ward: any;
  delivery: any;
  collect: any;
  sourceGHSV: string;
  product = {
    productIds: [],
    productNames: [],
    width: "",
    length: "",
    weight: 1000,
    height: "",
    orderCode: "",
    collectCost: "",
  };

  deliveries = [
    { type: 1, name: "Cho xem hàng nhưng không cho thử hàng" },
    { type: 2, name: "Cho thử hàng" },
    { type: 3, name: "Không cho xem hàng" },
  ];

  provinces: any[];
  districts: any[];
  wards: any[];
  sources = ["TPOS", "TRUSTSALES", "HARAVAN", "PANCAKE"];
  collects = [
    { type: 0, name: "Thu hộ = Tiền hàng + phí giao" },
    { type: 1, name: "Thu hộ = Tiền hàng" },
  ];

  constructor(
    private dmService: DanhMucService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private localStorage: LocalStorageService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private excelService: ExcelService
  ) {
    this.delivery = { type: 1, name: "Cho xem hàng nhưng không cho thử hàng" };
    this.collect = { type: 1, name: "Thu hộ = Tiền hàng" };
    this.product.weight = 1000;

    this.info = this.localStorage.retrieve("authenticationToken");
    if (this.info && this.info.role === "user") {
      this.dateRange = {
        startDate: dayjs().subtract(6, "days"),
        endDate: dayjs().add(1, "days"),
      };
    }
  }
  get isUser() {
    return this.info.role === "user";
  }
  get isShowButton() {
    const result = this.listCheck.some((item) => {
      return (
        item.status === 6 ||
        item.status === 7 ||
        item.status === 8 ||
        item.status === 9 ||
        item.status === 10 ||
        item.status === 11
      );
    });
    return this.info.role === "admin" && this.listCheck.length && result;
  }
  ngOnInit() {
    this.scriptPage();
    this.route.queryParams.subscribe((params) => {
      this.shopCode = params.shopCode;
      this.loadData();
    });
    this.getData();
  }

  ngAfterViewInit(): void {}

  getByStatus(e): void {
    console.log("e :>> ", e);
    this.ftTrangThai = e;
    this.listCheck = [];
    this.checkBoxValues = Array(this.itemsPerPage).fill(false);
    this.checkBoxUtil = new CheckBoxUtil();
    this.checkAllValues = false;
    this.loadData();
  }

  getData() {
    const params = {
      sort: ["id", "asc"],
      page: 0,
      size: 999,
      filter: "id>0",
    };
    this.dmService.query(params, this.REQUEST_URL).subscribe(
      (res: any) => {
        console.log("res :>> ", res);
      },
      () => {}
    );
  }

  public loadData() {
    if (this.info.role == "admin") {
      this.checkStatusActive = false;
    } else {
      if (
        this.localStorage.retrieve("check_work_active") &&
        this.info.role == "user"
      ) {
        this.checkStatusActive = false;
      } else {
        this.checkStatusActive = true;
        return;
      }
    }
    if (!this.shopCode) return;
    var date = JSON.parse(JSON.stringify(this.dateRange));
    date.endDate = date.endDate.replace("23:59:59", "00:00:00");
    let startDate = moment(date.startDate).format("YYYYMMDD") + "000000";
    let endDate = moment(date.endDate).format("YYYYMMDD") + "235959";
    const params = {
      sort: [this.sort, this.sortType ? "desc" : "asc"],
      page: this.page - 1,
      size: this.itemsPerPage,
      filter: this.filter(startDate, endDate),
    };
    this.spinner.show();
    this.dmService.query(params, this.REQUEST_URL).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body) {
          if (res.body.CODE === 200) {
            this.page = res.body ? res.body.RESULT.number + 1 : 1;
            this.totalItems = res.body ? res.body.RESULT.totalElements : 0;
            this.listEntity = res.body.RESULT.content;
            this.customDate(this.listEntity);
            // checkbox
            // checkbox
            this.checkBoxValues = this.checkBoxUtil.getPageCheckArray(
              this.listEntity
            );
            if (
              this.listEntity.length ===
                this.checkBoxValues.filter((k) => k === true).length &&
              this.listEntity.length !== 0
            ) {
              this.checkAllValues = true;
            } else {
              this.checkAllValues = false;
            }
            // load page
            if (this.listEntity.length === 0 && this.page > 1) {
              this.page = 1;
              this.loadData();
            }
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
        this.spinner.hide();
      },
      () => {
        this.notificationService.showError("Đã có lỗi xảy ra", "Error message");
        this.spinner.hide();
        console.error();
      }
    );
    this.loadDataCount();
  }

  public loadDataExcel() {
    if (!this.shopCode) return;
    var date = JSON.parse(JSON.stringify(this.dateRange));
    date.endDate = date.endDate.replace("23:59:59", "00:00:00");
    let startDate = moment(date.startDate).format("YYYYMMDD") + "000000";
    let endDate = moment(date.endDate).format("YYYYMMDD") + "235959";
    const params = {
      sort: [this.sort, this.sortType ? "desc" : "asc"],
      page: 0,
      size: 1000,
      filter: this.filter(startDate, endDate),
    };
    this.dmService.query(params, this.REQUEST_URL).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body && res.body.CODE === 200) {
          const list = res.body.RESULT.content;
          this.exportExcel(list);
        }
      },
      () => {
        this.notificationService.showError("Đã có lỗi xảy ra", "Error message");
        console.error();
      }
    );
  }

  private filter(startDate: any, endDate: any): string {
    const comparesArray: string[] = [];
    const {
      ftChiPhi,
      ftDoanhSo,
      ftKhachHang,
      ftNhanVien,
      ftSanPham,
      ftSdt,
      ftThoiGian,
      ftTrangThai,
      shopCode,
      ftNoteShipping,
      ftMaVanChuyen,
      ftNguoiVC,
      ftTaiKhoanVC,
    } = this;
    comparesArray.push(`id>0`);
    if (shopCode) comparesArray.push(`shopCode=="${shopCode}"`);
    if (startDate) comparesArray.push(`date >= ${startDate} `);
    if (endDate) comparesArray.push(`date <= ${endDate} `);
    if (ftTrangThai || ftTrangThai >= 0)
      comparesArray.push(`status=in=(${ftTrangThai})`);
    if (ftKhachHang) comparesArray.push(`name=="*${ftKhachHang.trim()}*"`);
    if (ftSdt) comparesArray.push(`phone=="*${ftSdt.trim()}*"`);
    if (ftSanPham) comparesArray.push(`product=="*${ftSanPham.trim()}*"`);
    if (ftNhanVien)
      comparesArray.push(`account.userName=="*${ftNhanVien.trim()}*"`);
    if (ftDoanhSo) comparesArray.push(`price==${ftDoanhSo}`);
    if (ftChiPhi) comparesArray.push(`cost==${ftChiPhi}`);
    if (ftNoteShipping) comparesArray.push(`noteShipping==${ftNoteShipping}`);
    if (ftMaVanChuyen) comparesArray.push(`shippingCode=="*${ftMaVanChuyen}*"`);
    if (ftNguoiVC)
      comparesArray.push(`shippingCreator.userName=="*${ftNguoiVC}*"`);
    if (ftTaiKhoanVC)
      comparesArray.push(`shippingAccount.name=="*${ftTaiKhoanVC}*"`);
    return comparesArray.join(";");
  }

  processFilter() {
    this.loadData();
  }

  sortData(e: any) {
    if (e !== this.sort) {
      this.sort = e;
      this.loadData();
    } else {
      this.sortType = !this.sortType;
      this.loadData();
    }
  }

  loadPage(page: number): void {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.loadData();
    }
  }

  loadDataCount() {
    var date = JSON.parse(JSON.stringify(this.dateRange));
    date.endDate = date.endDate.replace("23:59:59", "00:00:00");
    const startDate = moment(date.startDate).format("YYYYMMDD");
    const endDate = moment(date.endDate).format("YYYYMMDD");
    this.countList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (this.info.role == "admin") {
      this.dmService
        .getOption(
          null,
          this.REQUEST_URL,
          "/statisticdatabydateandstatus?startDate=" +
            startDate +
            "&endDate=" +
            endDate +
            "&shopCode=" +
            this.shopCode
        )
        .subscribe(
          (res: HttpResponse<any>) => {
            const result = res.body.RESULT;
            this.tongDoanhSo = 0;
            this.tongDon = 0;
            this.countGiaoHang = 0;
            for (let index = 0; index < result.length; index++) {
              this.countList[Number(result[index].status)] = Number(
                result[index].count
              );
              if (Number(result[index].status) >= 10) {
                this.countGiaoHang += Number(result[index].count);
              }
              this.tongDon += Number(result[index].count);
            }
            this.dmService
              .getOption(
                null,
                this.REQUEST_URL,
                "/statisticRevenue?startDate=" +
                  startDate +
                  "000000" +
                  "&endDate=" +
                  endDate +
                  "235959" +
                  "&shopCode=" +
                  this.shopCode
              )
              .subscribe((res: HttpResponse<any>) => {
                this.tongDoanhSo = res.body.RESULT;
                this.revenue = this.tongDoanhSo
                  ? Number(this.tongDoanhSo).toLocaleString("vi", {
                      style: "currency",
                      currency: "VND",
                    })
                  : Number(0).toLocaleString("vi", {
                      style: "currency",
                      currency: "VND",
                    });
              });
          },
          () => {
            console.error();
          }
        );
      return;
    }
    if (this.info.role == "user") {
      this.dmService
        .getOption(
          null,
          this.REQUEST_URL,
          "/statisticdatabydateandstatusanduser?startDate=" +
            startDate +
            "&endDate=" +
            endDate +
            "&shopCode=" +
            this.shopCode +
            "&userId=" +
            this.info.id
        )
        .subscribe(
          (res: HttpResponse<any>) => {
            const result = res.body.RESULT;
            this.tongDoanhSo = 0;
            this.tongDon = 0;
            this.countGiaoHang = 0;
            for (let index = 0; index < result.length; index++) {
              this.countList[Number(result[index].status)] = Number(
                result[index].count
              );
              if (Number(result[index].status) >= 10) {
                this.countGiaoHang += Number(result[index].count);
              }
              this.tongDoanhSo += Number(result[index].sum);
              this.tongDon += Number(result[index].count);
            }
          },
          () => {
            console.error();
          }
        );
      return;
    }
  }

  customDate(list: any[]): any[] {
    list.forEach((unitItem) => {
      unitItem.ngay = unitItem.date ? DateUtil.formatDate(unitItem.date) : null;
      unitItem.nhanvien = unitItem.account ? unitItem.account.userName : "";
      unitItem.nhanVienId = unitItem.account ? unitItem.account.id : "";
    });
    return list;
  }

  checkOnIndex(i: number): void {
    let data = this.listEntity[i];
    if (this.orders.includes(data)) {
      this.orders = this.orders.filter((x) => x.id != data.id);
    } else {
      this.orders.push(data);
    }

    if (this.checkBoxValues[i]) {
      this.listCheck = this.checkBoxUtil.addToCheckList(this.listEntity[i]);
    } else {
      this.listCheck = this.checkBoxUtil.removeFromCheckList(
        this.listEntity[i]
      );
      this.checkAllValues = false;
    }
    if (
      this.listEntity.length ===
      this.checkBoxValues.filter((k) => k === true).length
    ) {
      this.checkAllValues = true;
    }
  }

  checkAll(): void {
    if (this.checkAllValues) {
      for (let i = 0; i < this.listEntity.length; i++) {
        this.checkBoxValues[i] = true;
        this.listCheck = this.checkBoxUtil.addToCheckList(this.listEntity[i]);
      }
    } else {
      for (let i = 0; i < this.listEntity.length; i++) {
        this.checkBoxValues[i] = false;
        this.listCheck = this.checkBoxUtil.removeFromCheckList(
          this.listEntity[i]
        );
      }
    }

    this.orders = this.listCheck;
  }

  public assignWork() {
    if (this.listCheck.length === 0) {
      this.notificationService.showWarning(
        "Vui lòng chọn công việc",
        "Cảnh báo!"
      );
      return;
    }
    const modalRef = this.modalService.open(GiaoViecPopUpComponent, {
      windowClass: "modal-view",
      keyboard: true,
    });
    modalRef.componentInstance.data = this.listCheck;
    modalRef.componentInstance.shopCode = this.shopCode;
    modalRef.result.then(
      () => {
        this.listCheck = [];
        this.loadData();
      },
      () => {}
    );
  }

  public openChangeStatus() {
    if (this.listCheck.length === 0) {
      this.notificationService.showWarning(
        "Vui lòng chọn công việc",
        "Cảnh báo!"
      );
      return;
    }
    const modalRef = this.modalService.open(ChuyenTrangThaiPopUpComponent, {
      windowClass: "modal-view",
      keyboard: true,
    });
    modalRef.componentInstance.data = this.listCheck;
    modalRef.result.then(
      () => {
        this.listCheck = [];
        this.checkBoxValues = Array(this.itemsPerPage).fill(false);
        this.checkBoxUtil = new CheckBoxUtil();
        this.checkAllValues = false;
        this.loadData();
      },
      () => {}
    );
  }

  public openCreateOrder() {
    if (
      this.orders === null ||
      this.orders === undefined ||
      this.orders.length == 0
    ) {
      this.notificationService.showWarning(
        "Vui lòng chọn đơn hàng",
        "Cảnh báo!"
      );
      return;
    }

    var checkOrderInvalid = 0;
    var message = "";

    this.orders.map((order) => {
      if (order.status != 7 && order.status != 11) {
        checkOrderInvalid += -999999;
        message += `
                        Đơn hàng: '${order.name}' không hợp lệ\n
                        `;
      } else {
        checkOrderInvalid++;
      }
    });

    if (checkOrderInvalid > 0) {
      const modalRef = this.modalService.open(CreateOrderGHSVPopUpComponent, {
        windowClass: "modal-view",
        keyboard: false,
      });
      modalRef.componentInstance.listEntity = this.listCheck;
      modalRef.result.then(
        () => {
          // this.loadData();
          this.refresh();
        },
        () => {}
      );
    } else {
      this.notificationService.showError(message, "Thông báo lỗi!");
    }
  }

  openAutoAssignWork(): void {
    const modalRef = this.modalService.open(TuDongGiaoViecComponent, {
      size: "xl",
    });
    modalRef.componentInstance.shopCode = this.shopCode;
    modalRef.result.then(
      () => {
        this.loadData();
      },
      () => {}
    );
  }

  public onProcessData(): void {
    const modalRef = this.modalService.open(XuLyDuLieuPopupComponent, {
      size: "xl",
    });
    modalRef.componentInstance.data = [...this.selectedEntity];
    modalRef.result.then(
      () => {
        this.loadData();
      },
      () => {
        this.loadData();
      }
    );
    this.selectedEntity = undefined;
  }
  public onExportData(): void {
    const modalRef = this.modalService.open(TongKetDuLieuPopupComponent, {
      size: "xl",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.data = this.listEntity;
    modalRef.result.then(
      () => {
        this.loadData();
      },
      () => {}
    );
  }

  order: any;
  public onRowSelect(event: any): void {
    this.selectedId = event.id;
    this.order = event;

    this.selectedEntity = event;
    if (this.selectedEntity == event) {
      this.countXuLy = 1;
    } else {
      this.selectedEntity = event;
      this.countXuLy = -1;
    }
  }

  private convertToJson(stringValue: string) {
    return JSON.parse(stringValue);
  }

  private getCurrentDate() {
    let date = new Date();
    return moment(date).format("DD/MM/YYYY");
  }

  public onRowdblclick(event: any) {
    const modalRef = this.modalService.open(XuLyDuLieuPopupComponent, {
      size: "xl",
    });
    modalRef.componentInstance.data = event;
    modalRef.result.then(
      () => {
        this.loadData();
      },
      () => {}
    );
  }

  openPortalCall(): void {}

  refresh(): void {
    this.listCheck = [];
    this.orders = [];
    this.checkBoxValues = Array(this.itemsPerPage).fill(false);
    this.checkBoxUtil = new CheckBoxUtil();
    this.checkAllValues = false;
    this.ftTrangThai = "0,1,2,3,4,5,6,9";
    this.ftThoiGian = "";
    this.ftKhachHang = "";
    this.ftNguoiVC = "";
    this.ftMaVanChuyen = "";
    this.ftTaiKhoanVC = "";
    this.ftSdt = "";
    this.ftSanPham = "";
    this.ftNhanVien = "";
    this.ftDoanhSo = "";
    this.ftChiPhi = "";
    this.itemsPerPage = 10;
    this.page = 1;
    this.totalItems = 0;
    this.previousPage = 1;
    this.sort = "id";
    this.sortType = true;
    this.selectedEntity = {};
    this.selectedId = null;
    this.loadData();
  }

  formatDate(date: any) {
    return DateUtil.formatDate(date);
  }

  scriptPage(): void {
    $(window).resize(function (): void {
      if ($(window).height() > 780) {
        $(".boxscroll").height($(window).height()! - 380);
      } else {
        $(".boxscroll").height($(window).height()! - 230);
      }
    });
    $(window).trigger("resize");
  }

  exportExcel(listExport: any): void {
    const title = "ĐƠN HÀNG";
    const header = [
      "Trạng thái",
      "Thời gian",
      "Khách hàng",
      "Số điện thoại",
      "Sản phẩm",
      "Nhân viên",
      "Doanh số",
      "Mã vận chuyển",
      "Tài khoản vận chuyển",
      "Người lên đơn",
      "Ghi chú",
    ];
    const name = "LS_DATA_" + moment(new Date()).format("DDMMYYYY");
    const data = [];
    const column = [25, 25, 20, 25, 20, 25, 25, 25, 25, 25, 40];
    const footer = "F";
    const align = [
      "left",
      "left",
      "left",
      "left",
      "left",
      "left",
      "left",
      "left",
      "left",
      "left",
      "left",
    ];
    listExport.forEach((item) => {
      let status = "";
      switch (item.status) {
        case 0:
          status = "Mới";
          break;
        case 1:
          status = "Đã tiếp nhận";
          break;
        case 2:
          status = "Đang xử lý";
          break;
        case 3:
          status = "KNM L1";
          break;
        case 4:
          status = "KNM L2";
          break;
        case 5:
          status = "KNM L3";
          break;
        case 6:
          status = "Thất bại";
          break;
        case 9:
          status = "Trùng";
          break;
      }
      const entity = [
        status,
        DateUtil.formatDate(item.date),
        item.name,
        item.phone,
        item.product,
        item.nhanVienId ? item.saleAccount.fullName : "",
        item.price,
        item.shippingCode ? item.shippingCode : "",
        item.shippingAccount ? item.shippingAccount.name : "",
        item.shippingCreator ? item.shippingCreator.userName : "",
        item.note,
      ];
      data.push(entity);
    });

    this.excelService.generateExcel(
      title,
      header,
      data,
      name,
      footer,
      column,
      align
    );
    this.spinner.hide();
  }
  importData() {
    const modalRef = this.modalService.open(ImportDataPopup, {
      windowClass: "modal-view",
      keyboard: true,
    });
    modalRef.result.then(
      () => {
        this.loadData();
      },
      () => {}
    );
  }
}
