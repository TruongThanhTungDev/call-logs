import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root'
})
export class HeadersInterceptor implements HttpInterceptor {

  constructor(
    private localStorage:LocalStorageService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.localStorage.retrieve('authenticationToken');
    var header = 'Bearer ' + token.object;
    if (token) {
      request = request.clone({

        setHeaders: {
          Authorization: header,
          'Accept-Language': 'vi'
        }
      });
    }
    else {
      if (token) {
        request = request.clone({

          setHeaders: {
            Authorization: header,
            'Accept-Language': 'vi'
          }
        });
      }
    }

    return next.handle(request);
  }
}
