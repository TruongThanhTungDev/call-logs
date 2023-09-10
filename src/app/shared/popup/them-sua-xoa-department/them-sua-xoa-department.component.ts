import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DanhMucService } from "app/danhmuc.service";
import { NotificationService } from "app/notification.service";

@Component({
  selector: "department-popup",
  templateUrl: "./them-sua-xoa-department.component.html",
})
export class DepartmentPopup implements OnInit {
  @Input() data?: any;
  @Input() id?: any;
  @Input() title?: any;
  @Input() type?: any;
  listStatus: any[] = [
    {
      name: "Không hoạt động",
      value: 0,
    },
    {
      name: "Hoạt động",
      value: 1,
    },
  ];
  constructor(
    private activeModal: NgbActiveModal,
    private dmService: DanhMucService,
    private notification: NotificationService
  ) {}
  ngOnInit(): void {}

  create() {
    if (this.type === "add") {
    } else {
    }
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
}
