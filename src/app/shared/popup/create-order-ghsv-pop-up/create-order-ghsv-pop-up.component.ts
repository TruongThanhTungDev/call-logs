import { HttpResponse } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { NotificationService } from "app/notification.service";
import { HttpClient } from "@angular/common/http";
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from "ngx-webstorage";
@Component({
  selector: "chuyen-trang-thai-pop-up",
  templateUrl: "./create-order-ghsv-pop-up.component.html",
  styleUrls: ["./create-order-ghsv-pop-up.component.scss"],
})
export class CreateOrderGHSVPopUpComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() listEntity: any;
  REQUEST_CREATE_ORDER_URL = "/api/v1/order-shipping";
  province: any;
  district: any;
  ward: any;
  delivery: any;
  shop: any;
  collect: any;
  source: string;
  REQUEST_SHIPPING_TYPE = "/api/v1/accountShipping_type";
  REQUEST_SHIPPING_GROUP = "/api/v1/account_shipping_group";
  REQUEST_SHIPPING = "/api/v1/account_shipping";
  shippingType: any;
  shippingTypeList: any[];
  shippingGroupList: any[];
  selectedShippingGroup: any;
  accountShippingList: any[];
  selectedAccountShipping;
  any;
  shippingShopList: any[];
  selectedShippingShop: any;
  noteShipping = "";

  //test
  selectedCar: number;

  deliveries = [
    { id: 1, name: "Cho xem hàng nhưng không cho thử hàng" },
    { id: 2, name: "Cho thử hàng" },
    { id: 3, name: "Không cho xem hàng" },
  ];
  collects = [
    { id: 0, name: "Thu hộ = Tiền hàng + phí giao" },
    { id: 1, name: "Thu hộ = Tiền hàng" },
  ];

  provinces: any[];
  districts: any[];
  wards: any[];
  sources = ["TPOS", "TRUSTSALES", "HARAVAN", "PANCAKE"];

  creatingOrder = false;
  indexOfOrder = 0;
  successOrder = 0;
  failOrder = 0;

  constructor(
    private activeModal: NgbActiveModal,
    private service: DanhMucService,
    private notificationService: NotificationService,
    private localStorage: LocalStorageService
  ) {
    this.delivery = this.deliveries[0];
    this.collect = this.collects[1];

    this.shop = this.localStorage.retrieve("shop");
    // this.product.weight = 1000;
  }

  ngOnInit(): void {
    this.loadDataShippingGroup();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  public loadShippingType() {
    this.service.getOption(null, this.REQUEST_SHIPPING_TYPE, "").subscribe(
      (res: HttpResponse<any>) => {
        if (res.body.CODE == 200) {
          this.shippingTypeList = res.body.RESULT;
          this.shippingType = res.body.RESULT[0];
        } else
          this.notificationService.showError(
            res.body.MESSAGE,
            "Thông báo lỗi!"
          );
      },
      (error: any) => {
        this.notificationService.showError(
          `${error.body.RESULT.message}`,
          "Thông báo lỗi!"
        );
      }
    );
  }

  public loadDataShop() {
    this.shippingShopList = [];
    this.selectedShippingShop = null;
    if (!this.selectedAccountShipping) {
      return;
    }
    this.service
      .getOption(
        null,
        this.REQUEST_SHIPPING,
        "/get_shop_by_token?id=" + this.selectedAccountShipping.id
      )
      .subscribe(
        (res: HttpResponse<any>) => {
          if (res.body.CODE == 200) {
            this.shippingShopList = res.body.RESULT;
            if (this.shippingShopList.length > 0) {
              this.selectedShippingShop = this.shippingShopList[0];
            }
          } else
            this.notificationService.showError(
              res.body.MESSAGE,
              "Thông báo lỗi!"
            );
        },
        (error: any) => {
          this.notificationService.showError(
            `${error.body.RESULT.message}`,
            "Thông báo lỗi!"
          );
        }
      );
  }
  public loadDataShippingGroup() {
    const payload = {
      page: 0,
      size: 100,
      filter: "shop.id==" + this.shop.id,
      sort: ["isDefault", "desc"],
    };
    this.service.query(payload, this.REQUEST_SHIPPING_GROUP).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body.CODE == 200) {
          this.shippingGroupList = res.body.RESULT.content;
          if (this.shippingGroupList.length > 0) {
            this.selectedShippingGroup = this.shippingGroupList[0];
            this.loadDataAccountShipping();
          }
        } else
          this.notificationService.showError(
            res.body.MESSAGE,
            "Thông báo lỗi!"
          );
      },
      (error: any) => {
        this.notificationService.showError(
          `${error.body.RESULT.message}`,
          "Thông báo lỗi!"
        );
      }
    );
  }
  public loadDataAccountShipping() {
    this.accountShippingList = [];
    this.selectedAccountShipping = null;
    this.shippingShopList = [];
    this.selectedShippingShop = null;
    if (!this.selectedShippingGroup) {
      return;
    }
    const payload = {
      page: 0,
      size: 100,
      filter: "accountShippingGroup.id==" + this.selectedShippingGroup.id,
      sort: ["isDefault", "desc"],
    };
    this.service.query(payload, this.REQUEST_SHIPPING).subscribe(
      (res: HttpResponse<any>) => {
        if (res.body.CODE == 200) {
          this.accountShippingList = res.body.RESULT.content;
          if (this.accountShippingList.length > 0) {
            this.selectedAccountShipping = this.accountShippingList[0];
            this.loadDataShop();
          }
        } else
          this.notificationService.showError(
            res.body.MESSAGE,
            "Thông báo lỗi!"
          );
      },
      (error: any) => {
        this.notificationService.showError(
          `${error.body.RESULT.message}`,
          "Thông báo lỗi!"
        );
      }
    );
  }

  public dismiss(): void {
    this.activeModal.dismiss();
  }

  private convertJson(data) {
    try {
      return JSON.parse(data.productIds);
    } catch (error) {
      return [];
    }
  }

  addressOrder = {
    province: "",
    district: "",
    ward: "",
  };

  public pauseOrderGHSV() {
    this.creatingOrder = false;
  }
  public startOrderGHSV() {
    if (!this.selectedShippingShop) {
      this.notificationService.showWarning(`Vui lòng chọn shop`, "Thông báo!");
      return;
    }
    this.creatingOrder = true;
    this.createOrderGHSV();
  }

  public createOrderGHSV() {
    if (!this.creatingOrder) return;
    if (this.indexOfOrder >= this.listEntity.length) {
      this.creatingOrder = false;
      return;
    }
    this.order();
  }

  public order() {
    const data = this.listEntity[this.indexOfOrder];
    let request = {
      shippingOrderItems: [],
      accountShippingId: this.selectedAccountShipping.id,
      configDelivery: this.delivery.id,
      configCollect: this.collect.id,
      shopId: this.selectedShippingShop.id,
      noteShipping: this.noteShipping,
    };
    const product = {
      productIds: [],
      productNames: [],
      width: 0,
      length: 0,
      weight: 0,
      height: 0,
      orderCode: "",
      collectCost: "",
      note: "",
    };

    this.addressOrder.province = data.state;
    this.addressOrder.district = data.district;
    this.addressOrder.ward = data.ward;
    product.weight = 0;
    product.length = 0;
    product.width = 0;
    product.height = 0;
    let products = this.convertJson(data);
    products?.map((item) => {
      product.weight += item.product?.weight;
      product.productIds.push(item.product.id);
      product.productNames.push(
        item.product.name +
          "|" +
          item.product.code +
          "|" +
          item.product.properties +
          "|" +
          item.product.price
      );
    });

    var date = new Date();

    let orderGHSV = {
      shop_id: this.shop?.shopId,
      product: product.productNames.join(" , "),
      weight: product.weight,
      length: product.length,
      width: product.width,
      height: product.height,
      price: data.price,
      value: data.price,
      config_delivery: this.delivery.type,
      config_collect: this.collect.type,
      is_return: false,
      client_code: `${this.removeVietnameseTones(data.name).replace(
        /\s/g,
        ""
      )}-${date.getMilliseconds()}`,
      note: data.note ?? "",
      to_name: data.name,
      to_phone: `${data.phone}`,
      to_address: data.street,
      to_province: data.state,
      to_district: data.district,
      to_ward: data.ward,
      source: this.source ?? "",
      productId: product.productIds,
      data,
    };

    request.shippingOrderItems.push(orderGHSV);

    this.service
      .postOption(request, this.REQUEST_CREATE_ORDER_URL, "/shipping-orders")
      .subscribe(
        (res: HttpResponse<any>) => {
          if (res.body.CODE == 200) {
            this.notificationService.showSuccess(
              "Hoàn tất lên đơn",
              "Thông báo!"
            );
            this.successOrder++;
            this.listEntity[this.indexOfOrder].status = 8;
            this.listEntity[this.indexOfOrder].noteShipping = "";
          } else {
            this.notificationService.showError(
              "Gửi đơn thất bại",
              "Thông báo!"
            );
            this.failOrder++;
            this.listEntity[this.indexOfOrder].status = 11;
            this.listEntity[this.indexOfOrder].noteShipping = res.body.MESSAGE;
          }
          this.indexOfOrder++;
          this.createOrderGHSV();
        },
        (error: any) => {
          this.failOrder++;
          this.listEntity[this.indexOfOrder].status = 11;
          this.indexOfOrder++;
          this.createOrderGHSV();
        }
      );
  }

  private removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, " ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(
      /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
      " "
    );
    return str;
  }
}
