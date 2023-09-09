import { HttpResponse } from "@angular/common/http";
import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { NotificationService } from "app/notification.service";
import { jqxGridComponent } from "jqwidgets-ng/jqxgrid";
import moment from "moment";
import { LocalStorageService } from "ngx-webstorage";
import { ConfirmDialogComponent } from "app/layouts/confirm-dialog/confirm-dialog.component";
import { Plugin } from "app/shared/util/plugins";

@Component({
  selector: "jhi-XuLyDuLieuPopup",
  templateUrl: "./XuLyDuLieuPopup.component.html",
  styleUrls: ["./XuLyDuLieuPopup.component.scss"],
})
export class XuLyDuLieuPopupComponent implements OnInit, AfterViewInit {
  @Input() data: any = {};
  @ViewChild("gridReference") myGrid: jqxGridComponent;
  REQUEST_DATA_URL = "/api/v1/data";
  REQUEST_SUB_PRODUCT_URL = "/api/v1/sub-product";
  REQUEST_PRODUCT_URL = "/api/v1/product";
  REQUEST_CONFIG_URL = "/api/v1/config";
  REQUEST_ADDRESS_URL = "/api/v1/address";
  REQUEST_URL_DATA_CONFIG = "/api/v1/dataconfig";
  listProduct = [];
  listProductType = [];
  toltalProduct = 0;
  selectedProductEntity: any = [];
  source: any;
  dataAdapter: any;
  PRODUCT: any;
  info: any;
  callInfo: any;
  link!: SafeResourceUrl;
  listEntity = [];
  cauHinhDonHang: any = {
    thongTinDiaChi: [],
    thongTinGhiChu: [],
    thongTinKhachHang: [],
    thongTinSanPham: [],
    object: {},
  };
  showGrid = false;

  config: any;
  reason: any;
  plugins = new Plugin();
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
      width: 30,
      cellsrenderer: (row: number, column: any, value: number): string => {
        return '<div style="margin: 4px;">' + (value + 1) + "</div>";
      },
    },
    {
      text: "Thời gian",
      editable: false,
      datafield: "date",
      width: 100,
      cellsrenderer: (row: number, column: any, value: string): string => {
        return (
          value.toString().slice(0, 4) +
          "-" +
          value.toString().slice(4, 6) +
          "-" +
          value.toString().slice(6, 8)
        );
      },
    },
    {
      text: "Tên",
      editable: false,
      datafield: "name",
      width: 200,
      cellsrenderer: function (row, datafield, value) {
        if (value.length > 10) {
          let cellValueContainer = "<p class='cellClass'> " + value + "</p>";
          return cellValueContainer;
        }
      },
    },
    { text: "SĐT", editable: false, datafield: "phone", width: 100 },
    {
      text: "Địa chỉ",
      editable: false,
      datafield: "street",
      width: 200,
      cellsrenderer: function (row, datafield, value) {
        if (value.length > 15) {
          let cellValueContainer = "<p class='cellClass'> " + value + "</p>";
          return cellValueContainer;
        }
      },
    },
    {
      text: "Sản phẩm",
      editable: false,
      datafield: "product",
      width: 300,
      cellsrenderer: function (row, datafield, value) {
        if (value.length > 15) {
          let cellValueContainer = "<p class='cellClass'> " + value + "</p>";
          return cellValueContainer;
        }
      },
    },
    {
      text: "Ghi chú",
      editable: false,
      datafield: "message",
      width: 200,
      cellsrenderer: function (row, datafield, value) {
        if (value.length > 15) {
          let cellValueContainer = "<p class='cellClass'> " + value + "</p>";
          return cellValueContainer;
        }
      },
    },
    {
      text: "Nhân viên",
      editable: false,
      datafield: "nhanvien",
      width: 100,
      cellsrenderer: function (row, datafield, value) {
        if (value.length > 15) {
          let cellValueContainer = "<p class='cellClass'> " + value + "</p>";
          return cellValueContainer;
        }
      },
    },
    {
      text: "Trạng thái",
      editable: false,
      datafield: "status",
      width: 120,
      cellsrenderer: (row: number, column: any, value: number): string => {
        switch (value) {
          case 0: {
            return '<div class="div-center bg-light">' + "Mới" + "</div>";
          }
          case 1: {
            return (
              '<div class = "bg-info div-center text-white">' +
              "Đã tiếp nhận" +
              "</div>"
            );
          }
          case 2: {
            return (
              '<div class = "bg-primary div-center text-white">' +
              "Đang xử lý" +
              "</div>"
            );
          }
          case 3: {
            return (
              '<div class = "bg-warning div-center">' + "KNM L1" + "</div>"
            );
          }
          case 4: {
            return (
              '<div class = "bg-warning div-center">' + "KNM L2" + "</div>"
            );
          }
          case 5: {
            return (
              '<div class = "bg-warning div-center">' + "KNM L3" + "</div>"
            );
          }
          case 6: {
            return (
              '<div class = "bg-danger div-center text-white">' +
              "Thất bại" +
              "</div>"
            );
          }
          case 7: {
            return (
              '<div class = "bg-success div-center text-white">' +
              "Thành công" +
              "</div>"
            );
          }
          case 8: {
            return (
              '<div class = "bg-success div-center text-white">' +
              "Đã in đơn" +
              "</div>"
            );
          }
          case 9: {
            return (
              '<div class = "bg-gray div-center text-white">' +
              "Trùng" +
              "</div>"
            );
          }
          default: {
            return "<div></div>";
          }
        }
      },
    },
  ];
  selectedEntity: any;
  height: any = $(window).height()! - 270;
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
  constructor(
    private activeModal: NgbActiveModal,
    private service: DanhMucService,
    private notificationService: NotificationService,
    private dmService: DanhMucService,
    private localStorage: LocalStorageService,
    public sanitizer: DomSanitizer,
    private modalService: NgbModal
  ) {
    this.info = this.localStorage.retrieve("authenticationToken");
    this.callInfo = this.localStorage.retrieve("call_info");
    this.source = {
      localdata: [],
      datafields: [
        { name: "id", type: "number" },
        { name: "date", type: "number" },
        { name: "name", type: "string" },
        { name: "phone", type: "string" },
        { name: "nhanvien", type: "string" },
        { name: "street", type: "string" },
        { name: "message", type: "string" },
        { name: "product", type: "string" },
        { name: "status", type: "number" },
      ],
      id: "id",
      datatype: "array",
    };

    this.dataAdapter = new jqx.dataAdapter(this.source);
  }
  get disableInput() {
    return this.info.role === "admin" && this.data.status === 8;
  }
  get validSuccess() {
    if (this.listProductType.length == 0) {
      this.notificationService.showError(
        "Phải chọn sản phẩm trước khi chuyển sang trạng thái thành công!",
        "FAIL!"
      );
      return false;
    }
    if (!this.province) {
      this.notificationService.showError(
        "Bạn chưa chọn thông tin Tỉnh/huyện/xã",
        "Thông báo lỗi!"
      );
      return false;
    } else if (!this.district) {
      this.notificationService.showError(
        "Bạn chưa chọn thông tin Quận/Huyện",
        "Thông báo lỗi!"
      );
      return false;
    } else if (!this.ward) {
      this.notificationService.showError(
        "Bạn chưa chọn thông tin Phường/Xã",
        "Thông báo lỗi!"
      );
      return false;
    } else if (!this.data.street) {
      this.notificationService.showError(
        "Bạn chưa nhập thông tin địa chỉ",
        "Thông báo lỗi!"
      );
      return false;
    }
    return true;
  }
  REQUEST_CREATE_ORDER_URL = "/api/v1/order-shipping";
  province: any;
  district: any;
  ward: any;

  provinces: any[];
  districts: any[];
  wards: any[];

  product = {
    productIds: [],
    productNames: [],
    width: "",
    length: "",
    weight: 0,
    height: "",
    orderCode: "",
    collectCost: "",
  };

  ngOnInit(): void {
    this.loadCauHinhDonHang();
    let products = this.data.productIds
      ? JSON.parse(this.data.productIds)
      : null;
    if (products)
      products.map((product) => {
        this.product.weight += product.product.weight;
      });
    if (this.callInfo) {
      this.link = this.sanitizer.bypassSecurityTrustResourceUrl(
        // "https://localhost:3000?phone=" + this.data.phone + "&callid=" + this.callInfo.id
        "https://crm.adsxanh-market.com/callll?phone=" +
          this.data.phone +
          "&callid=" +
          this.callInfo.id
      );
    }
    if (this.data.deliveryFee == null) {
      this.data.deliveryFee = 0;
    }
    if (this.data.discount == null) {
      this.data.discount = 0;
    }
    if (this.data.cogs == null) {
      this.data.cogs = 0;
    }
    this.loadDataProduct();
    this.loadDataByPhone();
    this.getCost();
    this.listProductType = this.data.productIds
      ? JSON.parse(this.data.productIds)
      : [];
    this.getPrice();
  }

  ngAfterViewInit(): void {}

  loadCauHinhDonHang(): void {
    if (!this.data.shopCode) return;
    const objectInfo = this.data.dataInfo ? JSON.parse(this.data.dataInfo) : {};
    const entity = {
      page: 0,
      size: 5,
      filter: "shop.code==" + this.data.shopCode,
      sort: ["id", "desc"],
    };
    this.dmService.query(entity, this.REQUEST_URL_DATA_CONFIG).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body.CODE === 200) {
          const data: any[] = res.body.RESULT.content;
          const object = {};
          if (data.length > 0) {
            // địa chỉ
            const thongTinDiaChi: any[] = data[0].addressInfo
              ? JSON.parse(data[0].addressInfo)
                ? JSON.parse(data[0].addressInfo)
                : []
              : [];
            thongTinDiaChi.sort((a, b) => a.priority - b.priority);
            for (let i = 0; i < thongTinDiaChi.length; i++) {
              object[thongTinDiaChi[i].key] = objectInfo[thongTinDiaChi[i].key]
                ? objectInfo[thongTinDiaChi[i].key]
                : "";
              let count = 0;
              for (let j = 0; j < thongTinDiaChi.length; j++) {
                if (
                  thongTinDiaChi[i].priority === thongTinDiaChi[j].priority &&
                  count < 4
                ) {
                  count++;
                }
              }
              thongTinDiaChi[i].class = "col-" + 12 / count;
            }
            // ghi chú
            const thongTinGhiChu: any[] = data[0].noteInfo
              ? JSON.parse(data[0].noteInfo)
                ? JSON.parse(data[0].noteInfo)
                : []
              : [];
            thongTinGhiChu.sort((a, b) => a.priority - b.priority);
            for (let i = 0; i < thongTinGhiChu.length; i++) {
              object[thongTinGhiChu[i].key] = objectInfo[thongTinGhiChu[i].key]
                ? objectInfo[thongTinGhiChu[i].key]
                : "";
              let count = 0;
              for (let j = 0; j < thongTinGhiChu.length; j++) {
                if (
                  thongTinGhiChu[i].priority === thongTinGhiChu[j].priority &&
                  count < 4
                ) {
                  count++;
                }
              }
              thongTinGhiChu[i].class = "col-" + 12 / count;
            }
            // khách hàng
            const thongTinKhachHang: any[] = data[0].customerInfo
              ? JSON.parse(data[0].customerInfo)
                ? JSON.parse(data[0].customerInfo)
                : []
              : [];
            thongTinKhachHang.sort((a, b) => a.priority - b.priority);
            for (let i = 0; i < thongTinKhachHang.length; i++) {
              object[thongTinKhachHang[i].key] = objectInfo[
                thongTinKhachHang[i].key
              ]
                ? objectInfo[thongTinKhachHang[i].key]
                : "";
              let count = 0;
              for (let j = 0; j < thongTinKhachHang.length; j++) {
                if (
                  thongTinKhachHang[i].priority ===
                    thongTinKhachHang[j].priority &&
                  count < 4
                ) {
                  count++;
                }
              }
              thongTinKhachHang[i].class = "col-" + 12 / count;
            }
            // sản phẩm
            const thongTinSanPham: any[] = data[0].productInfo
              ? JSON.parse(data[0].productInfo)
                ? JSON.parse(data[0].productInfo)
                : []
              : [];
            thongTinSanPham.sort((a, b) => a.priority - b.priority);
            for (let i = 0; i < thongTinSanPham.length; i++) {
              object[thongTinSanPham[i].key] = objectInfo[
                thongTinSanPham[i].key
              ]
                ? objectInfo[thongTinSanPham[i].key]
                : "";
              let count = 0;
              for (let j = 0; j < thongTinSanPham.length; j++) {
                if (
                  thongTinSanPham[i].priority === thongTinSanPham[j].priority &&
                  count < 4
                ) {
                  count++;
                }
              }
              thongTinSanPham[i].class = "col-" + 12 / count;
            }
            // all
            this.cauHinhDonHang = {
              thongTinDiaChi: thongTinDiaChi,
              thongTinGhiChu: thongTinGhiChu,
              thongTinKhachHang: thongTinKhachHang,
              thongTinSanPham: thongTinSanPham,
              object: object,
            };
            if (!this.data.dataInfo) {
              this.cauHinhDonHang.object.name = this.data.name
                ? this.data.name
                : "";
              this.cauHinhDonHang.object.phone = this.data.phone
                ? this.data.phone
                : "";
              this.cauHinhDonHang.object.province = this.data.state
                ? this.data.state
                : "";
              this.cauHinhDonHang.object.district = this.data.district
                ? this.data.district
                : "";
              this.cauHinhDonHang.object.ward = this.data.ward
                ? this.data.ward
                : "";
              this.cauHinhDonHang.object.address = this.data.street
                ? this.data.street
                : "";
              this.cauHinhDonHang.object.note = this.data.note
                ? this.data.note
                : "";
            }
            this.getProvince();
          }
        } else {
          this.notificationService.showError(res.body.MESSAGE, "Error message");
        }
      },
      () => {
        console.error();
      }
    );
  }

  public loadDataByPhone() {
    this.dmService
      .getOption(
        null,
        this.REQUEST_DATA_URL,
        "/get-by-phone?phone=" +
          this.data.phone +
          "&shopCode=" +
          this.data.shopCode
      )
      .subscribe(
        (res: HttpResponse<any>) => {
          this.listEntity = res.body.RESULT;

          this.listEntity.forEach((unitItem) => {
            unitItem.nhanvien = unitItem.account
              ? unitItem.account.userName
              : "";
          });
          setTimeout(() => {
            this.source.localdata = this.listEntity;
            this.dataAdapter = new jqx.dataAdapter(this.source);
            // this.myGrid.clearselection();
          }, 100);
        },
        () => {
          console.error();
        }
      );
  }

  public loadDataProduct() {
    // this.toltalProduct =

    this.dmService
      .getOption(
        null,
        this.REQUEST_SUB_PRODUCT_URL,
        "/search?filter=product.shopcode==" +
          this.data.shopCode +
          ";status==1&sort=id,asc&size=1000&page=0"
      )
      .subscribe(
        (res: HttpResponse<any>) => {
          this.listProduct = res.body.RESULT.content;
        },
        () => {
          console.error();
        }
      );
  }

  // Lay chi phi moi don theo cau hinh
  public getCost() {
    let entity = { code: "CPVC" + this.data.shopCode };
    this.dmService
      .getOption(
        null,
        this.REQUEST_CONFIG_URL,
        "/search?filter=code==" +
          entity.code +
          ";status==1&sort=id,asc&size=1&page=0"
      )
      .subscribe(
        (res: HttpResponse<any>) => {
          this.config = res.body.RESULT.content[0];
        },
        () => {
          console.error();
        }
      );
  }

  onGiveShip(): void {
    window.open("#/bill?id=" + this.data.id);
  }

  save(i: any): void {
    this.data.state = this.cauHinhDonHang.object.province
      ? this.cauHinhDonHang.object.province
      : null;
    this.data.district = this.cauHinhDonHang.object.district
      ? this.cauHinhDonHang.object.district
      : null;
    this.data.ward = this.cauHinhDonHang.object.ward
      ? this.cauHinhDonHang.object.ward
      : null;
    this.data.street = this.cauHinhDonHang.object.address
      ? this.cauHinhDonHang.object.address
      : null;
    if (
      i === 7 ||
      i === 6 ||
      i === 8 ||
      i === 9 ||
      i === 10 ||
      i === 11 ||
      i === 12
    ) {
      this.data.saleId = this.data.saleAccount
        ? this.data.saleAccount.id
        : this.info.id;
    }
    if (!this.valid()) {
      return;
    } else {
      this.data.dateChanged = moment(new Date()).format("YYYYMMDDHHmmss");
      // this.data.status = i;
      this.data.productIds = JSON.stringify(this.listProductType);
      if (i === 6) this.data.price = 0;
      else if (i === 7 || i === 8 || i === 11) {
        if (this.validSuccess) {
          if (this.data.cost == null || this.data.cost == 0) {
            if (!this.config) {
              this.data.cost = 0;
            } else if (
              this.data.dateOnly < this.config.fromDate ||
              this.data.dateOnly > this.config.toDate
            ) {
              this.data.cost = this.config.defaultValue;
            } else {
              this.data.cost = this.config.value;
            }
          }
          let arr = this.listProductType.map((item) => {
            return {
              id: item.product.id,
              quantity: item.quantity,
            };
          });
          let body = { list: arr };
          this.dmService
            .postOption(body, this.REQUEST_PRODUCT_URL, "/price-import")
            .subscribe(
              (res: HttpResponse<any>) => {
                let valid = true;
                if (res.body.CODE == 200) {
                  this.data.totalProductValue = res.body.RESULT.costImport;
                  this.data.name = this.cauHinhDonHang.object.name
                    ? this.cauHinhDonHang.object.name
                    : this.data.name;
                  this.data.phone = this.cauHinhDonHang.object.phone
                    ? this.cauHinhDonHang.object.phone
                    : this.data.phone;
                  this.data.product = this.cauHinhDonHang.object.product
                    ? this.cauHinhDonHang.object.product
                    : this.data.product;
                  this.data.dataInfo = JSON.stringify(
                    this.cauHinhDonHang.object
                  );
                  const entity = {
                    dataList: [
                      {
                        ...this.data,
                        status: i,
                      },
                    ],
                  };
                  this.service
                    .postOption(entity, this.REQUEST_DATA_URL, "/assignWork")
                    .subscribe(
                      (res: HttpResponse<any>) => {
                        if (res.status === 200) {
                          this.activeModal.close();
                          this.notificationService.showSuccess(
                            `${res.body.MESSAGE}`,
                            "Thông báo!"
                          );
                        } else {
                          this.notificationService.showError(
                            `${res.body.MESSAGE}`,
                            "Thông báo lỗi!"
                          );
                        }
                      },
                      () => {
                        this.notificationService.showError(
                          "Đã có lỗi xảy ra",
                          "Thông báo lỗi!"
                        );
                      }
                    );
                } else {
                  this.notificationService.showError(
                    res.body.MESSAGE,
                    "Thông báo!"
                  );
                  valid = false;
                }
              },
              () => {
                this.notificationService.showError(
                  "Đã có lỗi xảy ra",
                  "Thông báo lỗi!"
                );
                console.error();
              }
            );
        }
        return;
      } else if (i === 10) {
        if (this.data.cost == null || this.data.cost == 0) {
          if (!this.config) {
            this.data.cost = 0;
          } else if (
            this.data.dateOnly < this.config.fromDate ||
            this.data.dateOnly > this.config.toDate
          ) {
            this.data.cost = this.config.defaultValue;
          } else {
            this.data.cost = this.config.value;
          }
        }
        this.data.cost;
        // this.data.price = 0;
        // this.data.deliveryFee = 0;
        // this.data.discount = 0;
      } else {
        this.data.cost = 0;
        // this.data.price = 0;
        // this.data.deliveryFee = 0;
        // this.data.discount = 0;
      }
      this.data.name = this.cauHinhDonHang.object.name
        ? this.cauHinhDonHang.object.name
        : this.data.name;
      this.data.phone = this.cauHinhDonHang.object.phone
        ? this.cauHinhDonHang.object.phone
        : this.data.phone;
      this.data.product = this.cauHinhDonHang.object.product
        ? this.cauHinhDonHang.object.product
        : this.data.product;
      this.data.dataInfo = JSON.stringify(this.cauHinhDonHang.object);
      const entity = {
        dataList: [
          {
            ...this.data,
            status: i,
          },
        ],
      };
      this.service
        .postOption(entity, this.REQUEST_DATA_URL, "/assignWork")
        .subscribe(
          (res: HttpResponse<any>) => {
            if (i !== -1) {
              this.activeModal.close();
            }
            this.notificationService.showSuccess(
              `${res.body.MESSAGE}`,
              "Thông báo!"
            );
          },
          () => {
            this.notificationService.showError(
              "Đã có lỗi xảy ra",
              "Thông báo lỗi!"
            );
          }
        );
    }
  }

  onChangeProduct(event: any) {
    for (let index = 0; index < this.listProductType.length; index++) {
      if (
        this.listProductType[index].product.id === this.selectedProductEntity.id
      ) {
        this.listProductType[index].quantity++;
        this.listProductType[index].price +=
          this.listProductType[index].product.price;
        this.getPrice();
        setTimeout(() => {
          this.selectedProductEntity = null;
        }, 200);
        return;
      }
    }
    const entity = {
      product: this.selectedProductEntity,
      quantity: 1,
      price: this.selectedProductEntity.price,
    };
    this.listProductType.push(entity);
    this.getPrice();

    setTimeout(() => {
      this.selectedProductEntity = null;
    }, 200);
  }
  onChangeQuantity(index: number) {
    if (this.listProductType[index].quantity <= 0) {
      this.notificationService.showError("Số lượng phải lớn hơn 0", "Error");
      this.listProductType[index].quantity = 1;
      this.listProductType[index].price =
        this.listProductType[index].product.price;
      this.getPrice();
    } else {
      this.listProductType[index].price =
        this.listProductType[index].product.price *
        this.listProductType[index].quantity;
      this.getPrice();
    }
  }

  onChangeQuantityClick(index: number, e: any) {
    if (this.disableInput) return;
    if (e) {
      this.listProductType[index].quantity++;
      this.listProductType[index].price =
        this.listProductType[index].product.price *
        this.listProductType[index].quantity;
      this.getPrice();
    } else {
      if (this.listProductType[index].quantity > 1) {
        this.listProductType[index].quantity--;
        this.listProductType[index].price =
          this.listProductType[index].product.price *
          this.listProductType[index].quantity;
        this.getPrice();
      }
    }
  }
  getMessage() {
    this.data.message = this.data.message + "," + this.reason;
  }

  getToTalProduct() {
    for (let index = 0; index < this.listProductType.length; index++) {
      if (this.listProductType[index].quantity <= 0) {
        this.listProductType.splice(index, 1);
      } else {
        this.toltalProduct +=
          Number(this.listProductType[index].product.price) *
          Number(this.listProductType[index].quantity);
        this.product.weight += Number(
          this.listProductType[index].product.weight
        );
      }
    }
  }

  getPrice() {
    if (this.valid() == false) {
      return;
    } else {
      this.toltalProduct = 0;
      this.product.weight = 0;
      this.getToTalProduct();
      this.getCOD();
    }
  }
  getCOD() {
    if (this.toltalProduct == 0) {
      this.data.price = 0;
      this.data.totalProductValue = 0;
    } else {
      let temp =
        Number(this.toltalProduct) -
        Number(this.data.discount) +
        Number(this.data.deliveryFee);
      if (temp <= 0) {
        this.data.price = 0;
      } else {
        this.data.price = temp;
      }
    }
  }
  removeFromListProductType(index: number) {
    if (this.disableInput) return;
    this.product.weight -= this.listProductType[index].product.weight;
    this.listProductType.splice(index, 1);
    this.getPrice();
  }

  // public validSuccess() {
  //   if (this.listProductType.length == 0) {
  //     this.notificationService.showError(
  //       "Phải chọn sản phẩm trước khi chuyển sang trạng thái thành công!",
  //       "FAIL!"
  //     );
  //     return false;
  //   }
  //   if (!this.data.state) {
  //     this.notificationService.showError(
  //       "Bạn chưa chọn thông tin Tỉnh/Thành phố",
  //       "Thông báo lỗi!"
  //     );
  //     return false;
  //   } else if (!this.data.district) {
  //     this.notificationService.showError(
  //       "Bạn chưa chọn thông tin Quận/Huyện",
  //       "Thông báo lỗi!"
  //     );
  //     return false;
  //   } else if (!this.data.ward) {
  //     this.notificationService.showError(
  //       "Bạn chưa chọn thông tin Phường/Xã",
  //       "Thông báo lỗi!"
  //     );
  //     return false;
  //   }
  //   return true;
  // }

  public valid() {
    if (
      this.data.discount < 0 ||
      !/^[0-9]+$/.test(this.data.discount) ||
      this.data.discount.toString().length > 15
    ) {
      this.notificationService.showError(
        "Giá tiền phải là số dương và không được lớn hơn 15 kí tự!",
        "Fail"
      );
      this.data.discount = 0;
      return false;
    }

    if (
      this.data.deliveryFee < 0 ||
      !/^[0-9]+$/.test(this.data.deliveryFee) ||
      this.data.deliveryFee.toString().length > 15
    ) {
      this.notificationService.showError(
        "Giá tiền phải là số dương và không được lớn hơn 15 kí tự!",
        "Fail"
      );
      this.data.deliveryFee = 0;
      return false;
    }

    if (
      this.data.cogs < 0 ||
      !/^[0-9]+$/.test(this.data.cogs) ||
      this.data.cogs.toString().length > 15
    ) {
      this.notificationService.showError(
        "Giá tiền phải là số dương và không được lớn hơn 15 kí tự!",
        "Fail"
      );
      this.data.cogs = 0;
      return false;
    }
    return true;
  }
  public onRowSelect(event: any): void {}
  public onRowdblclick(event: any): void {}
  public doCall(): void {
    const frame: any = document.getElementById("callFrame");
    frame.contentWindow.document.getElementById("btnCall").click();
  }
  public toggleGrid(): void {
    this.showGrid = !this.showGrid;
  }

  public decline(): void {
    this.activeModal.close(false);
  }

  public accept(): void {
    this.activeModal.close(true);
  }

  public dismiss(): void {
    this.activeModal.dismiss();
  }
  closeModal() {
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: "sm",
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.message = "Bạn có chắc chắn muốn thoát không?";
    modalRef.componentInstance.btnOkText = "Đồng ý";
    modalRef.componentInstance.btnCancelText = "Hủy";
    modalRef.result.then(
      () => {
        this.decline();
      },
      () => {}
    );
  }
  private getProvince() {
    this.dmService
      .getOption(null, this.REQUEST_ADDRESS_URL, "/provinces")
      .subscribe(
        (res: HttpResponse<any>) => {
          this.provinces = res.body.RESULT;
          this.checkProvine(this.cauHinhDonHang.object.province);
        },
        () => {
          console.error();
        }
      );
  }

  public getDistrict(e: any) {
    if (e) {
      this.province = e;
      this.dmService
        .getOption(
          null,
          this.REQUEST_ADDRESS_URL,
          "/districts?provinceId=" + e.id
        )
        .subscribe(
          (res: HttpResponse<any>) => {
            this.districts = res.body.RESULT;
            this.checkDistrict(this.cauHinhDonHang.object.district);
          },
          () => {
            console.error();
          }
        );
    } else {
      this.province = null;
      this.districts = [];
    }
  }

  public getWard(e: any) {
    if (e) {
      this.district = e;
      this.dmService
        .getOption(
          null,
          this.REQUEST_ADDRESS_URL,
          "/wards?provinceId=" + this.province.id + "&districtId=" + e.id
        )
        .subscribe(
          (res: HttpResponse<any>) => {
            this.wards = res.body.RESULT;
            this.checkWard(this.cauHinhDonHang.object.ward);
          },
          () => {
            console.error();
          }
        );
    } else {
      this.wards = [];
      this.district = null;
    }
  }

  onChangeWard(e: any) {
    this.ward = e;
  }

  public getAddress() {
    this.dmService
      .getOption(
        null,
        this.REQUEST_ADDRESS_URL,
        "?provinceId=" +
          this.province.id +
          "&districtId=" +
          this.district.id +
          "&communeId=" +
          this.ward.id
      )
      .subscribe(
        (res: HttpResponse<any>) => {
          console.log(res.body.RESULT);
        },
        () => {
          console.error();
        }
      );
  }

  private checkProvine(state) {
    if (state != null && state != undefined && state !== "") {
      const resultFind = this.provinces.filter((item) =>
        item.name.toLowerCase().includes(state.toLowerCase())
      );
      if (resultFind.length != 0) {
        this.province = resultFind[0];
        this.cauHinhDonHang.object.province = resultFind[0].name;
        this.getDistrict(this.province);
      } else {
        this.province = null;
      }
    } else {
    }
  }

  public checkDistrict(district) {
    if (district != null && district != undefined && district !== "") {
      const resultFind = this.districts.filter((item) =>
        item.name.toLowerCase().includes(district.toLowerCase())
      );
      if (resultFind.length != 0) {
        this.district = resultFind[0];
        this.cauHinhDonHang.object.district = resultFind[0].name;
        this.getWard(this.district);
      } else {
        this.district = null;
      }
    }
  }

  public checkWard(ward) {
    if (ward != null && ward != undefined && ward !== "") {
      const resultFind = this.wards.filter((item) =>
        item.name.toLowerCase().includes(ward.toLowerCase())
      );
      if (resultFind.length != 0) {
        this.ward = resultFind[0];
        this.cauHinhDonHang.object.ward = resultFind[0].name;
      } else {
        this.ward = null;
      }
    }
  }

  private updateProductWeight(): void {
    let products = JSON.parse(this.data?.productIds);
    if (products)
      products.map((product) => {
        this.product.weight += product.product.weight;
      });
  }
}
