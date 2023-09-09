import { Component } from "@angular/core";

@Component({
  selector: "department-cmp",
  templateUrl: "./department.component.html",
})
export class DepartmentComponent {
  fields: any[] = [
    {
      label: "Mã phòng ban",
      key: "code",
      class: "",
      style: "width: 15%",
    },
    {
      label: "Tên phòng ban",
      key: "name",
      class: "",
      style: "width: 45%",
    },
    {
      label: "Trạng thái",
      key: "status",
      class: "",
      style: "width: 15%",
    },
    {
      label: "Ghi chú",
      key: "note",
      class: "",
      style: "width: 25%",
    },
  ];
  data: any[] = [];
  totalItems = 0;
  page = 0;
  itemsPerPage = 0;

  loadPage(page: any) {}
}
