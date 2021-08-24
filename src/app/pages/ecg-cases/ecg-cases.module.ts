import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EcgCasesPageRoutingModule } from './ecg-cases-routing.module';

import { EcgCasesPage } from './ecg-cases.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/modules/shared/shared/shared.module';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
import { EditorModule } from '@tinymce/tinymce-angular';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EcgCasesPageRoutingModule,
    TranslateModule.forChild(),
    ReactiveFormsModule,
    SharedModule,
    NgxIonicImageViewerModule,
    EditorModule
  ],
  declarations: [EcgCasesPage]
})
export class EcgCasesPageModule {}
