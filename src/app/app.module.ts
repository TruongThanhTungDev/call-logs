import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ToastrModule } from "ngx-toastr";

import { SidebarModule } from "./sidebar/sidebar.module";
import { FooterModule } from "./shared/footer/footer.module";
import { NavbarModule } from "./shared/navbar/navbar.module";
import { FixedPluginModule } from "./shared/fixedplugin/fixedplugin.module";

import { AppComponent } from "./app.component";
import { AppRoutes } from "./app.routing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { QRCodeModule } from "angularx-qrcode";
import { jqxDateTimeInputModule } from "jqwidgets-ng/jqxdatetimeinput";
import { LogiinComponent } from "./pages/logiin/logiin.component";
import { NgxWebstorageModule } from "ngx-webstorage";
import { HeadersInterceptor } from "./headers.interceptor";

import { NgSelectModule } from "@ng-select/ng-select";
import { jqxGridModule } from "jqwidgets-ng/jqxgrid";
import { jqxPivotGridModule } from "jqwidgets-ng/jqxpivotgrid";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgxSpinnerModule } from "ngx-spinner";

import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { commonReducer } from "./shared/store/common/common.reducers";
import { environment } from "environments/environment";
import { ThemSuaXoaAccountComponent } from "./shared/popup/them-sua-xoa-account/them-sua-xoa-account.component";
import { SharedModule } from "./shared/popup/shared.module";

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    LogiinComponent,
    ThemSuaXoaAccountComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(AppRoutes, {
      useHash: true,
    }),
    SidebarModule,
    NavbarModule,
    ToastrModule.forRoot(),
    FooterModule,
    FixedPluginModule,
    NgbModule,
    HttpClientModule,
    QRCodeModule,
    jqxDateTimeInputModule,
    FormsModule,
    NgxWebstorageModule.forRoot({ prefix: "", separator: "" }),
    NgSelectModule,
    SharedModule,
    jqxGridModule,
    jqxPivotGridModule,
    NgxDaterangepickerMd,
    NgxSpinnerModule,
    ReactiveFormsModule,
    StoreModule.forRoot({
      common: commonReducer,
    }),
    StoreModule.forFeature("common", commonReducer),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HeadersInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
