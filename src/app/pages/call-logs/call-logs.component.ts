import { HttpResponse } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  DoCheck,
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { ConfirmationDialogService } from "app/layouts/confirm-dialog/confirm-dialog.service";
import { NotificationService } from "app/notification.service";
import { jqxGridComponent } from "jqwidgets-ng/jqxgrid";
import { CheckBoxUtil } from "app/shared/util/checkbox-util";
import $ from "jquery";
import moment from "moment";
import { statusLog } from "app/app.constants";
import { ExcelService } from "app/shared/util/exportExcel.service";
import { NgxSpinnerService } from "ngx-spinner";
import dayjs from "dayjs";
import {
  DateRanges,
  TimePeriod,
} from "ngx-daterangepicker-material/daterangepicker.component";
import { Plugin } from "app/shared/util/plugins";
import { LocalStorageService } from "ngx-webstorage";
@Component({
  selector: "call-logs-cmp",
  templateUrl: "call-logs.component.html",
  styleUrls: ["./call-logs.component.scss"],
})
export class CallLogsComponent implements OnInit, AfterViewInit, DoCheck {
  @ViewChild("gridReference") myGrid: jqxGridComponent;
  source: any;
  plugins = new Plugin();

  params = {
    page: 1,
    itemsPerPage: 10,
    extension: "",
    phone: "",
    calldate: "",
    duration: "",
    status: "",
    recording: "",
    blacklist: "",
    staffName: "",
  };
  previousPage = 1;
  totalItems = 0;
  sort = "calldate";

  sortType = true;
  isCheckAll = false;
  thongKe: any = null;
  fields = [
    {
      key: "extension",
      name: "Tài khoản",
      class: "",
      style: "",
    },
    {
      key: "phone",
      name: "Số điện thoại",
      class: "",
      style: {
        minWidth: "154px",
        width: "154px",
      },
    },
    {
      key: "calldate",
      name: "Thời gian",
      class: "",
      style: "",
    },
    {
      key: "duration",
      name: "Thời lượng",
      class: "",
      style: "",
    },
    {
      key: "status",
      name: "Trạng thái",
      class: "",
      style: {
        minWidth: "154px",
        width: "154px",
      },
    },
    {
      key: "name",
      name: "Nhân viên",
      class: "",
      style: "",
    },
    {
      key: "recording",
      name: "Ghi âm",
      class: "",
      style: "",
    },
    {
      key: "blacklist",
      name: "Danh sách đen",
      class: "",
      style: "",
    },
  ];
  data = [];
  listSelected = [];
  itemSelected = null;
  listUser: any[] = [];
  listStatus = [
    { id: 0, label: "Chờ xử lý" },
    { id: 1, label: "Đang xử lý" },
  ];
  dataAdapter: any;

  REQUEST_URL = "/api/v1/callLogs";
  REQUEST_USER = "/api/v1/user";
  selectedEntity: any;
  height: any = $(window).height()! - 270;
  shopcode = "";
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
  info: any
  callCode: any
  constructor(
    private dmService: DanhMucService,
    private notificationService: NotificationService,
    private confirmDialogService: ConfirmationDialogService,
    private modalService: NgbModal,
    private excelService: ExcelService,
    private spinner: NgxSpinnerService,
    private localStorage: LocalStorageService,
  ) {
    this.source = {
      localdata: [],
      datafields: [
        { name: "extension", type: "Tài khoản" },
        { name: "phone", type: "Số điện thoại" },
        { name: "name", type: "string" },
        { name: "status", type: "string" },
        { name: "url", type: "string" },
        { name: "b", type: "string" },
        { name: "status", type: "number" },
      ],
      id: "id",
      datatype: "array",
    };
    this.dataAdapter = new jqx.dataAdapter(this.source);
    this.dmService.getClickEvent().subscribe(() => {
      this.myGrid.render();
    });
    this.dateRange = {
      startDate: dayjs().subtract(6, "days"),
      endDate: dayjs().add(1, "days"),
    };
    this.info = this.localStorage.retrieve('authenticationtoken')
  }

  ngOnInit() {
  }
  ngAfterViewInit(): void {}
  ngDoCheck() {
    if (
      this.listSelected.length &&
      this.listSelected.length === this.data.length
    ) {
      this.isCheckAll = true;
    } else {
      this.isCheckAll = false;
    }
  }
  getDataCallLog() {
    if(this.info.roleList.includes('leader') || (this.info.roleList.includes('staff'))) {
      this.getCallLineByDepartment()
    } else {
      this.loadData()
    }
  }
  public loadData() {
    const payload = {
      page: this.params.page - 1,
      size: this.params.itemsPerPage,
      filter: this.filterData(),
      sort: [this.sort, this.sortType ? "desc" : "asc"],
    };
    this.spinner.show()
    this.dmService.query(payload, `${this.REQUEST_URL}`).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body.statusCode === 200) {
          this.totalItems = res.body.result.totalElements;
          this.params.page = res.body ? res.body.result.number + 1 : 1;
          // this.getThongKe();
          this.getAllUser(res.body.result.content);
          if (this.data.length === 0 && this.params.page > 1) {
            this.params.page = 1;
            this.getCallLineByDepartment();
          }
           this.spinner.hide();
        } else {
           this.spinner.hide();
          this.notificationService.showError(res.body.MESSAGE, "Error message");
        }
      },
      () => {
         this.spinner.hide();
        console.error();
      }
    );
  }
  getCallLineByDepartment() {
    const payload = {
      page: 0,
      size: 9999,
      deptId: this.info.departmentId,
      sort: ['id','sort']
    }
    this.dmService.getOption(payload,this.REQUEST_USER,'/getLineByDept')
    .subscribe(
      (res: HttpResponse<any>) => {
        if(res.body.statusCode === 200) {
          this.callCode = res.body.result.content[0]
          this.loadData()
        }
      }
    )
  }
  getAllUser(data) {
    const payload = {
      filter: "id>0",
      page: 0,
      size: 99999,
      sort: ["id", "asc"],
    };
    this.dmService
      .getOption(payload, this.REQUEST_USER, "/search")
      .subscribe((res: HttpResponse<any>) => {
        if (res.body.statusCode === 200) {
          this.listUser = res.body.result.content;
          this.data = data.map((item) => ({
            ...item,
            fullName: this.checkingCallCode(
              item.extension,
              res.body.result.content
            ),
          }));
        }
      });
  }
  checkingCallCode(code, list) {
    const result = list.find((item) => item.callCode == code);
    return result ? `${result.name} (${result.userName})` : code;
  }
  loadPage(page: number): void {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.getCallLineByDepartment();
    }
  }

  sortData(e: any) {
    if (e !== this.sort) {
      this.sort = e;
      this.getCallLineByDepartment();
    } else {
      this.sortType = !this.sortType;
      this.getCallLineByDepartment();
    }
  }

  public filterData() {
    const filter = [];
    this.params.page = 1;
    var date = JSON.parse(JSON.stringify(this.dateRange));
    date.endDate = date.endDate.replace("23:59:59", "00:00:00");
    let startDate = moment(date.startDate).format("YYYYMMDD") + "000000";
    let endDate = moment(date.endDate).format("YYYYMMDD") + "235959";
    filter.push(`calldate >= ${startDate};calldate <= ${endDate}`);
    if (this.info.roleList.includes('leader')) {
      filter.push(`extension=="*${this.callCode}*"`);
    }
    if (this.params.extension) {
      filter.push(`extension=="*${this.params.extension.trim()}*"`);
    }
    if (this.params.phone) {
      filter.push(`phone=="*${this.params.phone.trim()}*"`);
    }
    if (this.params.calldate) {
      let startFilterDate =
        moment(this.params.calldate).format("YYYYMMDD") + "000000";
      let endFilterDate =
        moment(this.params.calldate).format("YYYYMMDD") + "235959";
      filter.push(
        "calldate >=" + startFilterDate + ";calldate <=" + endFilterDate
      );
    }
    if (this.params.duration) {
      filter.push(`duration=="*${this.params.duration.trim()}*"`);
    }
    filter.push(`status=="ANSWERED"`);
    if (this.params.blacklist) {
      filter.push(`blacklist==${this.params.blacklist}`);
    }
    if (this.params.recording) {
      filter.push(`recording=="${this.params.recording}"`);
    }
    return filter.join(";");
  }
  public checkAll() {
    if (this.isCheckAll) {
      this.listSelected = this.data.map((item) => item.id);
    } else {
      this.listSelected = [];
    }
  }
  public onCheckboxChange(item: any) {
    const hasItem = this.listSelected.findIndex((e) => e === item.id);
    if (hasItem !== -1) {
      this.listSelected.splice(hasItem, 1);
    } else {
      this.listSelected.push(item.id);
    }
  }
  public selectRow(item: any) {
    this.listSelected = [item.id];
    this.itemSelected = item;
    this.shopcode = item.id;
  }
  public convertDateTime(date) {
    return date
      ? moment(date, "YYYYMMDDhhmmss").format("DD/MM/YYYY HH:mm:ss")
      : "";
  }
  convertTime(time) {
    const duration = moment(time, "seconds");
    const hour = Math.floor(duration.hours());
    const minute = Math.floor(duration.minutes());
    const second = duration.seconds();
    if (hour > 0) {
      return `${hour} giờ ${minute} phút ${second} giây`;
    } else if (minute > 0) {
      return `${minute} phút ${second} giây`;
    } else {
      return `${second} giây`;
    }
  }
  public formatPhone(number) {
    return number ? number.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3") : "";
  }
  formatStatus(status) {
    switch (status) {
      case status === statusLog.ANSWERED:
        return "Đã trả lời";
      case status === statusLog.BUSY:
        return "Máy bận";
      case status === statusLog.NO_ANSWER:
        return "Không trả lời";
      default:
        break;
    }
  }
  exportTOExcel(): void {
    this.spinner.show();
    const payload = {
      page: 0,
      size: 100000,
      filter: this.filterData(),
      sort: [this.sort, this.sortType ? "desc" : "asc"],
    };
    this.dmService.query(payload, `${this.REQUEST_URL}`).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body.CODE === 200) {
          const list = res.body.RESULT.content;
          this.exportExcel(list);
        } else {
          this.notificationService.showError(res.body.MESSAGE, "Error message");
          this.spinner.hide();
        }
      },
      () => {
        this.spinner.hide();
        console.error();
      }
    );
  }

  exportExcel(listExport: any): void {
    const title = "CALL LOGS";
    const header = [
      "Tài khoản",
      "Số điện thoại",
      "Thời gian",
      "Thời lượng",
      "Trạng thái",
      "Ghi âm",
      "Danh sách đen",
    ];
    const name = "LS_CALLLOGS_" + moment(new Date()).format("DDMMYYYY");
    const data = [];
    const column = [10, 15, 25, 20, 20, 45, 15];
    const footer = "F";
    const align = ["left", "left", "left", "left", "left", "left", "left"];
    for (let i = 0; i < listExport.length; i++) {
      const entity = [
        listExport[i].extension,
        listExport[i].phone,
        listExport[i].calldate
          ? this.convertDateTime(listExport[i].calldate)
          : "",
        listExport[i].duration,
        listExport[i].status,
        listExport[i].recording,
        listExport[i].blacklist,
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
}
