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
        path: "/dashboard",
        title: "Dashboard",
        icon: "	fa fa-cube",
        class: "",
        role: "",
        params: "",
        show: true,
        items: [],
      },
      {
        path: "/notF",
        title: "Sản phẩm",
        icon: "	fa fa-cubes",
        class: "",
        role: "admin",
        params: "",
        show: true,
        items: [
          {
            path: "/kho/quan-ly-san-pham",
            title: "Quản lý sản phẩm",
            icon: "",
            class: "",
            role: "admin",
            params: { shopCode: "KHBOM" },
          },
          {
            path: "/kho/nhap-hang",
            title: "Nhập hàng",
            icon: "",
            class: "",
            role: "admin",
            params: { shopCode: "KHBOM" },
          },
          {
            path: "/kho/xuat-hang",
            title: "Xuất hàng",
            icon: "",
            class: "",
            role: "admin",
            params: { shopCode: "KHBOM" },
          },
          {
            path: "/kho/hang-loi",
            title: "Hàng lỗi",
            icon: "",
            class: "",
            role: "admin",
            params: { shopCode: "KHBOM" },
          },
          {
            path: "/d",
            title: "Kiểm hàng",
            icon: "",
            class: "",
            role: "admin",
            params: { shopCode: "KHBOM" },
          },
          {
            path: "/kho/lich-su-xuat-nhap",
            title: "Lịch sử xuất nhập",
            icon: "",
            class: "",
            role: "admin",
            params: { shopCode: "KHBOM" },
          },
        ],
      },
      {
        path: "/notF",
        title: "Đơn hàng",
        icon: "fa fa-archive",
        class: "",
        role: "admin",
        params: "",
        show: true,
        items: [
          {
            path: "/data",
            title: "Order",
            icon: "nc-basket",
            class: "",
            role: "user",
            params: { shopCode: "KHBOM" },
          },
          {
            path: "/data-after-order",
            title: "Đơn hàng",
            icon: "nc-basket",
            class: "",
            role: "user",
            params: { shopCode: "KHBOM" },
          },
          {
            path: "/notF",
            title: "Danh sách hàng hoàn",
            icon: "nc-basket",
            class: "",
            role: "user",
            params: { shopCode: "KHBOM" },
          },
        ],
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
            params: { shopCode: "KHBOM" },
          },
        ],
      },
      {
        path: "/notF",
        title: "Đối tác",
        icon: "	fa fa-handshake-o",
        class: "",
        role: "",
        params: "",
        show: true,
        items: [
          {
            path: "/notF",
            title: "Khách hàng",
            icon: "nc-basket",
            class: "",
            role: "",
            params: "",
          },
          {
            path: "/notF",
            title: "Nhà cung cấp",
            icon: "nc-basket",
            class: "",
            role: "",
            params: "",
          },
        ],
      },
      {
        path: "/notF",
        title: "Thu chi",
        icon: "fa fa-laptop",
        class: "",
        role: "",
        params: "",
        show: true,
        items: [
          {
            path: "/costType",
            title: "Loại chi phí",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/cost",
            title: "Bản ghi chi phí",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/cost-marketing",
            title: "Chi phí marketing",
            icon: "nc-basket",
            class: "",
            role: "marketing",
            params: "",
          },
        ],
      },
      {
        path: "/notF",
        title: "Giao hàng",
        icon: "fa fa-truck",
        class: "",
        role: "",
        params: "",
        show: true,
        items: [
          {
            path: "/delivery-order",
            title: "Đơn hàng",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/delivery-finance",
            title: "Đối soát",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/create-order",
            title: "Tạo đơn hàng",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          }
        ],
      },
      {
        path: "/notF",
        title: "Báo cáo",
        icon: "	fa fa-pie-chart",
        class: "",
        role: "",
        params: "",
        show: true,
        items: [
          {
            path: "/utm-statistic",
            title: "Hiệu suất Marketing",
            icon: "nc-basket",
            class: "",
            role: "marketing",
            params: "",
          },
          {
            path: "/statiscal-revenue",
            title: "Thống kê dòng tiền",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/statistics-general",
            title: "Thống kê doanh số",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/statiscal-cost",
            title: "Thống kê chi phí",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/statistic-performance-sale",
            title: "Thống kê hiệu suất sale",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/statistics-order",
            title: "Thống kê đơn hàng",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/notF",
            title: "Thống kê sản phẩm",
            icon: "nc-basket",
            class: "",
            role: "",
            params: "",
          },
          {
            path: "/notF",
            title: "Thống kê vận chuyển",
            icon: "nc-basket",
            class: "",
            role: "",
            params: "",
          },
          {
            path: "/calllogs",
            title: "Thống kê cuộc gọi",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/notF",
            title: "Tài chính tổng hợp",
            icon: "nc-basket",
            class: "",
            role: "",
            params: "",
          },
        ],
      },
      {
        path: "/notF",
        title: "Cấu hình",
        icon: "	fa fa-cog",
        class: "",
        role: "",
        params: "",
        show: true,
        items: [
          {
            path: "/utm-medium",
            title: "Cấu hình UTM",
            icon: "nc-basket",
            class: "",
            role: "marketing",
            params: "",
          },
          {
            path: "/kho/quan-ly-kho",
            title: "Cấu hình Kho",
            icon: "",
            class: "",
            role: "admin",
            params: { shopCode: "KHBOM" },
          },
          {
            path: "/config",
            title: "Cấu hình",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/order-config",
            title: "Cấu hình đơn hàng",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
          {
            path: "/notF",
            title: "Cấu hình chi phí",
            icon: "nc-basket",
            class: "",
            role: "",
            params: "",
          },
          {
            path: "/notF",
            title: "Cấu hình phân quyền",
            icon: "nc-basket",
            class: "",
            role: "",
            params: "",
          },
          {
            path: "/notF",
            title: "Danh mục sản phẩm",
            icon: "nc-basket",
            class: "",
            role: "",
            params: "",
          },
          {
            path: "/setting-shipping",
            title: "Đơn vị vận chuyển",
            icon: "nc-basket",
            class: "",
            role: "admin",
            params: "",
          },
        ],
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
        if (this.info.role === "admin" || this.info.role === "marketing") {
          this.setMenu();
          this.loadData(this.menuItems);
        } else {
          this.loadShopList();
        }
        // if (this.shopCode) {
        //   this.loadShopList();
        // } else {
        //   this.setMenu();
        //   this.loadData(this.menuItems);
        // }
      }
    });
  }

  setMenu() {
    if (this.info.role === "admin") {
      this.menuItems = this.shopCode ? ROUTES : [];
    } else {
      if (this.info.role === "user") {
        this.menuItems = [
          {
            path: "/work",
            title: "Chấm công",
            icon: "nc-icon nc-tap-01",
            class: "",
            role: "user",
            params: "",
            items: [],
          },
          {
            path: "/notF",
            title: this.shopInfo ? this.shopInfo.name : "Đơn hàng",
            icon: "fa fa-archive",
            class: "",
            role: "",
            params: "",
            show: true,
            items: [
              {
                path: "/data",
                title: "Order",
                icon: "nc-basket",
                class: "",
                role: "user",
                params: { shopCode: this.shopCode },
              },
              {
                path: "/data-after-order",
                title: "Đơn hàng",
                icon: "nc-basket",
                class: "",
                role: "user",
                params: { shopCode: this.shopCode },
              },
            ],
          },
        ];
      } else {
        this.menuItems = [
          {
            path: "/utm-medium",
            title: "Cấu hình utm",
            icon: "nc-icon nc-single-copy-04",
            class: "border-bottom ",
            role: "marketing",
            params: { shopCode: "KHBOM" },
            items: [],
          },
          {
            path: "/notF",
            title: "Thu chi",
            icon: "fa fa-laptop",
            class: "",
            role: "",
            params: "",
            show: true,
            items: [
              {
                path: "/cost-marketing",
                title: "Chi phí marketing",
                icon: "nc-basket",
                class: "",
                role: "marketing",
                params: "",
              },
            ],
          },
          {
            path: "/notF",
            title: "Báo cáo",
            icon: "	fa fa-pie-chart",
            class: "",
            role: "",
            params: "",
            show: true,
            items: [
              {
                path: "/utm-statistic",
                title: "Hiệu suất Marketing",
                icon: "nc-basket",
                class: "",
                role: "marketing",
                params: "",
              },
            ],
          },
        ];
      }
    }
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
