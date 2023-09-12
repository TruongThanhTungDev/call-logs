import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { DanhMucService } from "app/danhmuc.service";
import { HttpResponse } from "@angular/common/http";
import { LocalStorageService } from "ngx-webstorage";
import { NotificationService } from "app/notification.service";
@Component({
  selector: "app-logiin",
  templateUrl: "./logiin.component.html",
  styleUrls: ["./logiin.component.scss"],
})
export class LogiinComponent implements OnInit {
  @ViewChild("formLogin")
  formLogin!: NgForm;
  users: any;
  username = "";
  password = "";

  REQUEST_URL = "/api/v1/user/login";

  constructor(
    private router: Router,
    private localStorage: LocalStorageService,
    private dmService: DanhMucService,
    private notificationSerivce: NotificationService
  ) {}

  ngOnInit(): void {
    this.localStorage.clear();
  }
  onSubmit(data: any) {
    const entity = {
      userName: this.username,
      password: this.password,
    };

    this.dmService.postOption(entity, this.REQUEST_URL, "").subscribe(
      (res: any) => {
        if (res.body.statusCode === 200) {
          this.localStorage.store("authenticationToken", res.body.result);
          this.localStorage.store("token", res.body.result.token);
          setTimeout(() => {
            this.router.navigate(["/calllogs"]);
          }, 200);
        } else {
          this.notificationSerivce.showError("Đăng nhập thất bại", "Cảnh báo");
        }
      },
      () => {
        this.notificationSerivce.showError("Đăng nhập thất bại", "Cảnh báo");
        console.error();
      }
    );
  }
}
