import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DanhMucService } from 'app/danhmuc.service';
import { HttpResponse } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { NotificationService } from 'app/notification.service';
@Component({
  selector: 'app-logiin',
  templateUrl: './logiin.component.html',
  styleUrls: ['./logiin.component.scss']
})
export class LogiinComponent implements OnInit {

  @ViewChild('formLogin')
  formLogin!: NgForm;
  users: any;
  username="";
  password="";
  
  REQUEST_URL = '/api/v1/account/login'
 
  constructor(
    private router:Router,
    private localStorage: LocalStorageService,
    private dmService: DanhMucService,
    private notificationSerivce: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.localStorage.clear();
  }
  onSubmit(data:any){
    const entity = {
      userName : this.username,
      passWord : this.password
    }
    
   this.dmService.postOption(entity, this.REQUEST_URL, '').subscribe(
      (res: HttpResponse<any>) => {
        if(res.body.CODE===200){
          this.localStorage.store('authenticationToken', res.body.RESULT);
          this.localStorage.store('check_work_active', false);
          setTimeout(() => {
            if(res.body.RESULT.role === "admin")
              this.router.navigate(['/shop']);
            else if(res.body.RESULT.role === "marketing")
              this.router.navigate(['/utm-medium']);
            else {
              this.router.navigate(['/work']);
            }
          }, 200);
          
        }else{
          this.notificationSerivce.showError("Đăng nhập thất bại","Cảnh báo");
        }

      },
      () => {
        this.notificationSerivce.showError("Đăng nhập thất bại","Cảnh báo");
        console.error();
      }
    );
  }
}

