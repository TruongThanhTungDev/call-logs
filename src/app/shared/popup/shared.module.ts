
import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CurrencyMaskDirective } from '../util/currency-mask.directive';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: any): any {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
@NgModule({
  imports: [
    
  ],
  declarations: [
    
    CurrencyMaskDirective
  ],
  providers: [
   
  ],
  entryComponents: [
    
  ],
  exports: [
    CurrencyMaskDirective
  ]
})
export class SharedModule {}
