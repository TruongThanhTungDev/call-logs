import { HttpResponse } from "@angular/common/http";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { ConfirmationDialogService } from "app/layouts/confirm-dialog/confirm-dialog.service";
import { NotificationService } from "app/notification.service";
import DateUtil from "app/shared/util/date.util";
import { ExcelService } from "app/shared/util/exportExcel.service";
import { Plugin } from "app/shared/util/plugins";
import dayjs from "dayjs";
import { jqxGridComponent } from "jqwidgets-ng/jqxgrid";
import moment from "moment";
import {
  DateRanges,
  TimePeriod,
} from "ngx-daterangepicker-material/daterangepicker.component";
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from "ngx-webstorage";
@Component({
  moduleId: module.id,
  selector: "work-cmp",
  templateUrl: "work.component.html",
})
export class WorkComponent implements OnInit, AfterViewInit {
  @ViewChild("gridReference") myGrid: jqxGridComponent;
  source: any;
  info: any = null;
  shopCode: any = "";
  listStatus = [
    { id: 0, label: "Chờ xử lý" },
    { id: 1, label: "Đang xử lý" },
  ];
  plugins = new Plugin();
  dataAdapter: any;
  columns: any[] = [
    {
      text: "#",
      sortable: false,
      filterable: false,
      editable: false,
      groupable: false,
      draggable: false,
      resizable: false,
      datafield: "",
      columntype: "number",
      width: 50,
      cellsrenderer: (row: number, column: any, value: number): string => {
        return (
          '<div style="margin: 4px;margin-top: 14.5px;">' +
          (value + 1) +
          "</div>"
        );
      },
    },
    { text: "Tài Khoản", editable: false, datafield: "userName" },
    { text: "Check in", editable: false, datafield: "ngayVao" },
    { text: "Check out", editable: false, datafield: "ngayRa" },
    {
      text: "Tổng Đơn Giao",
      editable: false,
      datafield: "totalOrder",
      cellsrenderer: (row: number, column: any, value: number): string => {
        return (
          "<div style='margin: 4px;margin-top: 14.5px;'>" +
          this.plugins.formatNumber(value) +
          "</div>"
        );
      },
    },
    {
      text: "Đơn Đã Xử Lý",
      editable: false,
      datafield: "processedOrder",
      cellsrenderer: (row: number, column: any, value: number): string => {
        return (
          "<div style='margin: 4px;margin-top: 14.5px;'>" +
          this.plugins.formatNumber(value) +
          "</div>"
        );
      },
    },
    {
      text: "Đơn Hoàn Thành",
      editable: false,
      datafield: "successOrder",
      cellsrenderer: (row: number, column: any, value: number): string => {
        return (
          "<div style='margin: 4px;margin-top: 14.5px;'>" +
          this.plugins.formatNumber(value) +
          "</div>"
        );
      },
    },
  ];
  height: any = $(window).height()! - 240;
  localization: any = {
    pagergotopagestring: "Trang",
    pagershowrowsstring: "Hiển thị",
    pagerrangestring: " của ",
    emptydatastring: "Không có dữ liệu hiển thị",
    filterstring: "Nâng cao",
    filterapplystring: "Áp dụng",
    filtercancelstring: "Huỷ bỏ",
  };
  pageSizeOptions = ["50", "100", "200"];

  // date
  dateRange: TimePeriod = {
    startDate: dayjs().startOf("month"),
    endDate: dayjs().endOf("month"),
  };
  date: object;
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
  REQUEST_URL = "/api/v1/work";

  selectedEntity: any;

  constructor(
    private dmService: DanhMucService,
    private notificationService: NotificationService,
    private confirmDialogService: ConfirmationDialogService,
    private modalService: NgbModal,
    private excelService: ExcelService,
    private localStorage: LocalStorageService,
    private spinner: NgxSpinnerService
  ) {
    this.source = {
      localdata: [],
      datafields: [
        { name: "id", type: "number" },
        { name: "ngayVao", type: "string" },
        { name: "ngayRa", type: "string" },
        { name: "totalOrder", type: "string" },
        { name: "successOrder", type: "string" },
        { name: "processedOrder", type: "string" },
        { name: "ghiChu", type: "string" },
        { name: "userName", type: "any" },
      ],
      id: "id",
      datatype: "array",
    };
    this.dataAdapter = new jqx.dataAdapter(this.source);
    this.dmService.getClickEvent().subscribe(() => {
      this.myGrid.render();
    });
    this.info = this.localStorage.retrieve("authenticationtoken");
    this.shopCode = localStorage.retrieve("shop")
      ? localStorage.retrieve("shop").code
      : "";
  }

  ngOnInit() {
    this.checkLoadData();
  }

  checkLoadData() {
    if (this.info.role === "admin") {
      this.loadDataAdmin();
    } else {
      this.loadData();
    }
  }

  ngAfterViewInit(): void {
    this.myGrid.pagesizeoptions(this.pageSizeOptions);
  }
  public loadData() {
    var date = JSON.parse(JSON.stringify(this.dateRange));
    let startDate = moment(date.startDate).format("YYYYMMDD") + "000000";
    let endDate = moment(date.endDate).format("YYYYMMDD") + "235959";
    this.dmService
      .getOption(
        null,
        this.REQUEST_URL,
        "?startDate=" + startDate + "&endDate=" + endDate
      )
      .subscribe(
        (res: HttpResponse<any>) => {
          this.source.localdata = this.customDate(res.body.RESULT);
          this.dataAdapter = new jqx.dataAdapter(this.source);
        },
        () => {
          console.error();
        }
      );
  }

  loadDataAdmin() {
    var date = JSON.parse(JSON.stringify(this.dateRange));
    let startDate = moment(date.startDate).format("YYYYMMDD") + "000000";
    let endDate = moment(date.endDate).format("YYYYMMDD") + "235959";
    const params = {
      sort: ["id", "desc"],
      page: 0,
      size: 100000,
      filter:     
        "timeIn >=" +
        startDate +
        ";timeIn <=" +
        endDate,
    };
    this.dmService.query(params, this.REQUEST_URL).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body) {
          if (res.body.CODE === 200) {
            this.source.localdata = this.customDate(res.body.RESULT.content);
            this.dataAdapter = new jqx.dataAdapter(this.source);
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

  customDate(list: any[]): any[] {
    list.forEach((unitItem) => {
      unitItem.ngayVao = unitItem.timeIn
        ? DateUtil.formatDate(unitItem.timeIn)
        : null;
      unitItem.ngayRa = unitItem.timeOut
        ? DateUtil.formatDate(unitItem.timeOut)
        : null;
      unitItem.userName = unitItem.account
        ? unitItem.account.fullName + "(" + unitItem.account.userName + ")"
        : "";
    });
    return list;
  }
  public onRowSelect(event: any): void {
    this.selectedEntity = event.args.row;
  }

  createData(): void {}
  updateData(): void {}
  deleteData(): void {}

  exportTOExcel(): void {
    this.spinner.show();
    var date = JSON.parse(JSON.stringify(this.dateRange));
    let startDate = moment(date.startDate).format("YYYYMMDD") + "000000";
    let endDate = moment(date.endDate).format("YYYYMMDD") + "235959";
    this.dmService
      .getOption(
        null,
        this.REQUEST_URL,
        "?startDate=" + startDate + "&endDate=" + endDate
      )
      .subscribe(
        (res: HttpResponse<any>) => {
          const list = this.customDate(res.body.RESULT);
          this.exportExcel(list);
        },
        () => {
          this.spinner.hide();
          console.error();
        }
      );
  }

  exportExcel(listExport: any): void {
    const title = "Danh sách chấm công ";
    const header = [
      "Tài khoản",
      "Check in",
      "Check out",
      "Tổng đơn giao",
      "Đơn đã xử lý",
      "Đơn hoàn thành",
    ];
    const name = "DS_CHAMCONG_" + moment(new Date()).format("DDMMYYYY");
    const data = [];
    const column = [40, 30, 30, 30, 30, 30];
    const footer = "F";
    const align = ["left", "left", "left", "left", "left", "left"];
    for (let i = 0; i < listExport.length; i++) {
      const entity = [
        listExport[i].userName,
        listExport[i].ngayVao,
        listExport[i].ngayRa,
        listExport[i].totalOrder,
        listExport[i].processedOrder,
        listExport[i].successOrder,
      ];
      data.push(entity);
    }
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

  reLoad(): void {
    this.dateRange = {
      startDate: dayjs().startOf("month"),
      endDate: dayjs().endOf("month"),
    };
    this.checkLoadData();
  }
}
