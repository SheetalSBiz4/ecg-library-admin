import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumberDirective } from 'src/app/directives/only-number/only-number.directive';
import { SearchFilterPipe } from 'src/app/pipe/search-filter.pipe';



@NgModule({
  declarations: [NumberDirective, SearchFilterPipe],
  imports: [
    CommonModule
  ],
  exports: [NumberDirective, SearchFilterPipe]
})
export class SharedModule { }
