import { Component } from "@angular/core";

@Component({
  selector: "department-cmp",
  templateUrl: "./department.component.html",
})
export class DepartmentComponent {
  fields: any[] = [];
  data: any[] = [];
  totalItems = 0;
  page = 0;
  itemsPerPage = 0;

  loadPage(page: any) {}
}
