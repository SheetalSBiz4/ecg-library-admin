import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SwitchCasePage } from './switch-case.page';

const routes: Routes = [
  {
    path: '',
    component: SwitchCasePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SwitchCasePageRoutingModule {}
