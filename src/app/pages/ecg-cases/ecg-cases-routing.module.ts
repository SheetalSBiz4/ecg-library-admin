import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EcgCasesPage } from './ecg-cases.page';

const routes: Routes = [
  {
    path: '',
    component: EcgCasesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EcgCasesPageRoutingModule {}
