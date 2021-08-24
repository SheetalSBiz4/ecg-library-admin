import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OTPVerificationPage } from './otpverification.page';

const routes: Routes = [
  {
    path: '',
    component: OTPVerificationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OTPVerificationPageRoutingModule {}
