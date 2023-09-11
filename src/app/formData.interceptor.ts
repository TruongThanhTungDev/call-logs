import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { LocalStorageService } from "ngx-webstorage";

@Injectable({
  providedIn: "root",
})
export class FormDataInterceptor implements HttpInterceptor {
  constructor(private localStorage: LocalStorageService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.localStorage.retrieve("authenticationToken");
    var header = "Bearer " + token.token;
    if (token && request.body instanceof FormData) {
      request = request.clone({
        setHeaders: {
          Authorization: header,
          "Accept-Language": "vi",
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: header,
            "Accept-Language": "vi",
          },
        });
      }
    }

    return next.handle(request);
  }
}
