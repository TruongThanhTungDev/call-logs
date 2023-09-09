import { Routes } from "@angular/router";
import { AccountComponent } from "app/pages/account/account.component";
import { CallLogsComponent } from "app/pages/call-logs/call-logs.component";
import { DepartmentComponent } from "app/pages/department/department.component";
import { DataComponent } from "app/pages/data/data.component";
import { WorkComponent } from "app/pages/work/work.component";

export const AdminLayoutRoutes: Routes = [
  { path: "calllogs", component: CallLogsComponent },
  { path: "account", component: AccountComponent },
  { path: "department", component: DepartmentComponent },
  { path: "work", component: WorkComponent },
  { path: "data", component: DataComponent },
];
