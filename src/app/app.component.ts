import { Component } from '@angular/core';
import moment, { Moment } from 'moment';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent{

 constructor(private deviceService: DeviceDetectorService){
    const deviceInfo:any = this.deviceService.getDeviceInfo();
    // if(deviceInfo){
    //     if(deviceInfo.deviceType === 'mobile'){
    //         window.location.href = 'http://m.adsxanhgroup.store/'
    //     }
        
    // }
 }
 /* Date Range Picker*/
 selected: { startDate: Moment; endDate: Moment; };
  
 ranges: any = {
     Today: [moment(), moment()],
     Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
     'Last 7 Days': [moment().subtract(6, 'days'), moment()],
     'Last 30 Days': [moment().subtract(29, 'days'), moment()],
     'This Month': [moment().startOf('month'), moment().endOf('month')],
     'Last Month': [
     moment()
         .subtract(1, 'month')
         .startOf('month'),
     moment()
         .subtract(1, 'month')
         .endOf('month')
     ],
     'Last 3 Month': [
     moment()
         .subtract(3, 'month')
         .startOf('month'),
     moment()
         .subtract(1, 'month')
         .endOf('month')
     ]
 };
 /* End Date Range Picker */
}
