import {
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { ROUTES } from "../../sidebar/sidebar.component";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { LocalStorageService } from "ngx-webstorage";
import { DanhMucService } from "app/danhmuc.service";
import { HttpResponse } from "@angular/common/http";
import * as moment from "moment";
import { ConfirmationDialogService } from "app/layouts/confirm-dialog/confirm-dialog.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NotificationService } from "app/notification.service";
import { Store } from "@ngrx/store";
import { CheckOutComponent } from "../popup/checkout/checkout.component";
import { CheckInComponent } from "../popup/checkin/checkin.component";
@Component({
  moduleId: module.id,
  selector: "navbar-cmp",
  templateUrl: "navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  private listTitles: any[] = [];
  location: Location;
  modalRef!: NgbModalRef;
  private nativeElement: Node;
  private toggleButton;
  private sidebarVisible: boolean;
  public checkWorkActive = false;
  public info: any;
  public isCollapsed = true;
  public disableToggle = false;
  shopCode: String;
  shopList: any;
  language = "vi";
  time = "";
  @ViewChild("navbar-cmp", { static: false }) button;
  constructor(
    location: Location,
    private renderer: Renderer2,
    private element: ElementRef,
    private router: Router,
    private notificationService: NotificationService,
    private local: LocalStorageService,
    private dmService: DanhMucService,
    private confirmDialogService: ConfirmationDialogService,
    private modalService: NgbModal,
    private store: Store<any>
  ) {
    this.location = location;
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
    this.info = this.local.retrieve("authenticationToken");
  }

  ngOnInit() {
    setTimeout(() => {
      this.listTitles = ROUTES.filter((listTitle) => listTitle);
    }, 1000);
    var navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName("navbar-toggle")[0];
    // this.router.events.subscribe((event) => {
    //   this.sidebarClose();
    // });

    this.getAccountStatus();
    this.getTime();
  }

  getTitle() {
    var title = this.location.prepareExternalUrl(this.location.path());
    if (title.charAt(0) === "#") {
      title = title.slice(1);
    }

    if (title.split("?")[0] === "/data" && title.split("?")[1]) {
      return "Đơn hàng " + title.split("?")[1].split("=")[1];
    }
    const listMenuItem = [
      { ma: "/work", title: "Chấm công" },
      { ma: "/account", title: "Tài khoản" },
      { ma: "/department", title: "Danh sách Phòng ban" },
      { ma: "/callogs", title: "Thống kê cuộc gọi" },
      { ma: "data", title: "Data" },
    ];
    for (let i = 0; i < listMenuItem.length; i++) {
      if (listMenuItem[i].ma === title.split("?")[0]) {
        return listMenuItem[i].title;
      }
    }
    return "Bảng điều khiển";
  }
  getAccountStatus(): void {
    this.disableToggle = true;
    this.store.dispatch({
      type: "SET_LOADING_COMPLETED",
      payload: false,
    });
    this.dmService.post("/api/v1/work/checkActive", "").subscribe(
      (res: any) => {
        if (res.statusCode === 200) {
          if (res.result) {
            this.checkWorkActive = true;
            this.local.store("check_work_active", true);
            this.store.dispatch({
              type: "SET_LOADING_COMPLETED",
              payload: true,
            });
          } else {
            this.checkWorkActive = false;
            this.store.dispatch({
              type: "SET_LOADING_COMPLETED",
              payload: true,
            });
          }
        } else {
          this.checkWorkActive = false;
          this.store.dispatch({
            type: "SET_LOADING_COMPLETED",
            payload: true,
          });
        }
        this.disableToggle = false;
      },
      () => {
        this.checkWorkActive = false;
        this.disableToggle = false;
        console.error();
        this.store.dispatch({
          type: "SET_LOADING_COMPLETED",
          payload: true,
        });
      }
    );
  }
  sidebarToggle() {
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
    setTimeout(() => {
      this.dmService.sendClickEvent();
    }, 500);
  }
  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const html = document.getElementsByTagName("html")[0];
    const mainPanel = <HTMLElement>(
      document.getElementsByClassName("main-panel")[0]
    );
    setTimeout(function () {
      toggleButton.classList.add("toggled");
    }, 500);

    html.classList.add("nav-open");
    // if(window.innerWidth < 1920){
    //   mainPanel.style.width = '83%';
    // }
    if (window.innerWidth < 991) {
      mainPanel.style.position = "fixed";
    }
    this.sidebarVisible = true;
  }
  sidebarClose() {
    const html = document.getElementsByTagName("html")[0];
    const mainPanel = <HTMLElement>(
      document.getElementsByClassName("main-panel")[0]
    );
    // if(window.innerWidth < 1920){
    //   mainPanel.style.width = '100%';
    // }
    if (window.innerWidth < 991) {
      setTimeout(function () {
        mainPanel.style.position = "";
      }, 500);
    }
    this.toggleButton.classList.remove("toggled");
    this.sidebarVisible = false;
    html.classList.remove("nav-open");
  }
  collapse() {
    this.isCollapsed = !this.isCollapsed;
    const navbar = document.getElementsByTagName("nav")[0];
    console.log(navbar);
    if (!this.isCollapsed) {
      navbar.classList.remove("navbar-transparent");
      navbar.classList.add("bg-primary");
    } else {
      navbar.classList.add("navbar-transparent");
      navbar.classList.remove("bg-primary");
    }
  }

  changeLanguage(e: any): void {
    this.language = e;
  }

  getTime(): void {
    this.time = moment(new Date()).format("YYYY/MM/DD HH:mm:ss");
    setTimeout(() => {
      this.getTime();
    }, 1000);
  }

  logout() {
    this.confirmDialogService
      .confirm("Xác nhận đăng xuất?", "Đồng ý", "Hủy")
      .then((confirmed: any) => {
        if (confirmed) {
          this.local.clear();
          setTimeout(() => {
            this.router.navigate(["/login"]);
          }, 200);
        }
      })
      .catch(() => console.log("Đã có lỗi xảy ra"));
  }
  onTriggerWorkActive(): void {
    this.checkWorkActive = !this.checkWorkActive;
    if (this.checkWorkActive) {
      this.modalRef = this.modalService.open(CheckInComponent, {
        keyboard: true,
        backdrop: "static",
        size: "lg",
      });
      this.modalRef.result.then((res: any) => {
        if (res) {
          // this.getAccountStatus();
          setTimeout(() => {}, 200);
        } else {
          this.checkWorkActive = !this.checkWorkActive;
        }
        window.location.reload();
      });
    } else {
      this.modalRef = this.modalService.open(CheckOutComponent, {
        keyboard: true,
        backdrop: "static",
        size: "lg",
      });
      this.modalRef.result.then((res: any) => {
        if (res) {
          // this.getAccountStatus();
          setTimeout(() => {}, 200);
        } else {
          this.checkWorkActive = !this.checkWorkActive;
        }
        window.location.reload();
      });
    }
  }
}
