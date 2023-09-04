import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AdminLayoutRoutes } from "./admin-layout.routing";

import { jqxGridModule } from "jqwidgets-ng/jqxgrid";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { jqxDateTimeInputModule } from "jqwidgets-ng/jqxdatetimeinput";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { jqxPivotGridModule } from "jqwidgets-ng/jqxpivotgrid";
import { CallLogsComponent } from "app/pages/call-logs/call-logs.component";
import { ExcelService } from "app/shared/util/exportExcel.service";
import { NgSelectModule } from "@ng-select/ng-select";
import { AccountComponent } from "app/pages/account/account.component";
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
    jqxGridModule,
    jqxPivotGridModule,
    NgSelectModule,
    jqxDateTimeInputModule,
    ReactiveFormsModule,
    NgxDaterangepickerMd.forRoot(),
  ],
  declarations: [CallLogsComponent, AccountComponent],
  providers: [ExcelService],
})
export class AdminLayoutModule {}
