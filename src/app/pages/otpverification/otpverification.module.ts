import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OTPVerificationPageRoutingModule } from './otpverification-routing.module';

import { OTPVerificationPage } from './otpverification.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/modules/shared/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OTPVerificationPageRoutingModule,
    TranslateModule.forChild(),
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [OTPVerificationPage]
})
export class OTPVerificationPageModule {}
