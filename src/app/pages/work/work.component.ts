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
export class WorkComponent implements OnInit {
  @ViewChild("gridReference") myGrid: jqxGridComponent;
  source: any;
  info: any = null;
  shopCode: any = "";
  listStatus = [
    { id: 0, label: "Chờ xử lý" },
    { id: 1, label: "Đang xử lý" },
  ];
  data: any[] = [];
  fields: any[] = [
    {
      label: "Tài Khoản",
      key: "username",
    },
    {
      label: "Check in",
      key: "checkin",
    },
    {
      label: "Check out",
      key: "checkout",
    },
    {
      label: "Tổng đơn giao",
      key: "totalOrder",
    },
    {
      label: "Đơn Đã xử lý",
      key: "processedOrder",
    },
    {
      label: "Đơn hoàn thành",
      key: "successOrder",
    },
  ];
  totalItems = 0;
  page = 1;
  itemsPerPage = 10;

  plugins = new Plugin();
  dataAdapter: any;
  params={
  page: 1,
  itemsPerPage: 10,
  username:"",
  timeIn:"",
  timeOut:"",
  totalOrder: 0,
  processedOrder:0,
  successOrder:0,
  }
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
  }

  ngOnInit() {}

  loadData() {
    
    const params = {
      sort: ["id", "desc"],
      page: this.page - 1,
      size: this.itemsPerPage,
      filter: this.filterData(),
    };
    this.spinner.show();
    this.dmService.query(params, this.REQUEST_URL).subscribe(
      (res: any) => {
        if (res.body.statusCode === 200) {
          this.spinner.hide();
          this.data = res.body.result.content.map((item: any) => {
            return {
              ...item,
              timeIn: item.timeIn
                ? moment(item.timeIn, "YYYYMMDDHHmms").format(
                    "HH:mm:ss DD/MM/YYYY"
                  )
                : "",
              timeOut: item.timeOut
                ? moment(item.timeOut, "YYYYMMDDHHmms").format(
                    "HH:mm:ss DD/MM/YYYY"
                  )
                : "",
            };
          });
          this.totalItems = res.body.result.totalElements;
        } else {
          this.spinner.hide();
          this.notificationService.showError(
            "Đã có lỗi xảy ra",
            "Error message"
          );
        }
      },
      () => {
        this.spinner.hide();
        this.notificationService.showError("Đã có lỗi xảy ra", "Error message");
        console.error();
      }
    );
  }
  public filterData() {
    const filter = [];
    var date = JSON.parse(JSON.stringify(this.dateRange));
    let startDate = moment(date.startDate).format("YYYYMMDD") + "000000";
    let endDate = moment(date.endDate).format("YYYYMMDD") + "235959";
    this.params.page = 1;
    filter.push("id>0");
    filter.push("timeIn >=" + startDate + ";timeIn <=" + endDate);    
    if (this.params.username) {
      filter.push(`staff.name=="*${this.params.username.trim()}*"`);
    }
    if (this.params.timeIn) {
      filter.push(`timeIn==${this.params.timeIn}`);
    }
    if (this.params.timeOut) {
      filter.push(`timeOut==${this.params.timeOut}`);
    }
    if (this.params.totalOrder) {
      filter.push(`totalOrder==${this.params.totalOrder}`);
    }
    if (this.params.processedOrder) {
      filter.push(`processedOrder==${this.params.processedOrder}`);
    }
    if (this.params.successOrder) {
      filter.push(`successOrder==${this.params.successOrder}`);
    }
    return filter.join(";");
  }
  processFilter() {
    this.loadData();
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
    this.loadData();
  }
  loadPage(page: any) {}
}
