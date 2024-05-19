import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchasesRoutingModule } from './purchases-routing.module';
import { PurchasesComponent } from './purchases.component';
import { MatTableModule } from '@angular/material/table';
import { CustomCurrencyPipe } from '../../shared/pipes/custom-currency.pipe';


@NgModule({
  declarations: [
    PurchasesComponent
  ],
  imports: [
    CommonModule,
    PurchasesRoutingModule,
    MatTableModule,
    CustomCurrencyPipe,
  ]
})
export class PurchasesModule { }
