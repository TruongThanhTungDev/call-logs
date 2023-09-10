import { HttpResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { DanhMucService } from "app/danhmuc.service";
import { NotificationService } from "app/notification.service";
import { LocalStorageService } from "ngx-webstorage";
export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  role: string;
  params: any;
  show: boolean;
  items: any;
}

export let ROUTES: RouteInfo[] = [];

@Component({
  moduleId: module.id,
  selector: "sidebar-cmp",
  templateUrl: "sidebar.component.html",
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  info: any;
  REQUEST_URL_SHOP = "/api/v1/shop";
  isCollapsedCP = true;
  isCollapsedBC = true;
  isCollapsedKho = true;
  shop = null;
  shopCode = "";
  ACCOUNT_URL = "/api/v1/account";
  listShopForUser = [];
  SHOP_URL = "/api/v1/shop";
  shopInfo: any;
  constructor(
    private localStorage: LocalStorageService,
    private dmService: DanhMucService,
    private store: Store<any>
  ) {
    ROUTES = [
      {
        path: "/calllogs",
        title: "Thống kê cuộc gọi",
        icon: "fa fa-gear",
        class: "",
        role: "admin",
        params: "",
        show: true,
        items: [],
      },
      {
        path: "/notF",
        title: "Nhân viên",
        icon: "fa fa-user",
        class: "",
        role: "user",
        params: "",
        show: true,
        items: [
          {
            path: "/work",
            title: "Chấm công",
            icon: "nc-basket",
            class: "",
            role: "user",
            params: "",
          },
          {
            path: "/account",
            title: "Nhân viên",
            icon: "nc-basket",
            class: "",
            role: "user",
            params: {},
          },
        ],
      },
      {
        path: "/department",
        title: "Phòng ban",
        icon: "fa fa-briefcase",
        class: "",
        role: "admin",
        params: "",
        show: true,
        items: [],
      },
      {
        path: "/data",
        title: "Order",
        icon: "fa fa-archive",
        class: "",
        role: "admin",
        params: "",
        show: true,
        items: [],
      },
    ];
    this.info = this.localStorage.retrieve("authenticationToken");
  }
  ngOnInit() {
    this.store.subscribe((state) => {
      const loadingCompleted = state.common.isLoadCompleted;
      if (loadingCompleted) {
      }
    });
    this.setMenu();
  }

  setMenu() {
    this.menuItems = ROUTES;
  }
}
