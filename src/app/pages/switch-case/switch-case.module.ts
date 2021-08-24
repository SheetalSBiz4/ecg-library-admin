import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SwitchCasePageRoutingModule } from './switch-case-routing.module';

import { SwitchCasePage } from './switch-case.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/modules/shared/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SwitchCasePageRoutingModule,
    TranslateModule.forChild(),
    ReactiveFormsModule
  ],
  declarations: [SwitchCasePage]
})
export class SwitchCasePageModule {}
