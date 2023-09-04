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
        path: "/account",
        title: "Nhân viên",
        icon: "fa fa-user",
        class: "",
        role: "admin",
        params: "",
        show: true,
        items: [],
      },
    ];
    this.info = this.localStorage.retrieve("authenticationToken");
    this.shop = this.localStorage.retrieve("shop");
    this.dmService.getClickEvent().subscribe(() => {
      this.shop = this.localStorage.retrieve("shop");
    });
  }
  ngOnInit() {
    this.store.subscribe((state) => {
      const loadingCompleted = state.common.isLoadCompleted;
      if (loadingCompleted) {
        this.shopCode = this.localStorage.retrieve("shopcode");
        this.setMenu();
        this.loadData(this.menuItems);
      }
    });
  }

  setMenu() {
    this.menuItems = ROUTES;
  }

  loadData(list: any): void {
    list.forEach((e) => {
      if (e.params) {
        e.params.shopCode = this.shopCode;
      }
      if (e.items.length > 0) {
        for (let i = 0; i < e.items.length; i++) {
          if (e.items[i].params) {
            e.items[i].params.shopCode = this.shopCode;
          }
        }
      }
    });
  }
  public loadShopList() {
    this.dmService.getOption(null, this.SHOP_URL, `?status=1`).subscribe(
      (res: HttpResponse<any>) => {
        this.shopInfo = res.body.RESULT[0];
        this.setMenu();
      },
      () => {
        console.error();
      }
    );
  }
}
