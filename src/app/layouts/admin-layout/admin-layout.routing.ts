import { Routes } from "@angular/router";
import { AccountComponent } from "app/pages/account/account.component";
import { CallLogsComponent } from "app/pages/call-logs/call-logs.component";

export const AdminLayoutRoutes: Routes = [
  { path: "calllogs", component: CallLogsComponent },
  { path: "account", component: AccountComponent },
];
