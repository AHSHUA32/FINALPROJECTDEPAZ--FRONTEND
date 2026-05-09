import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminRoutingModule } from './admin-routing.module';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { SubNavComponent } from './subnav.component';
import { AccountsComponent } from './accounts/accounts.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        AdminRoutingModule
    ],
    declarations: [
        LayoutComponent,
        OverviewComponent,
        SubNavComponent,
        AccountsComponent
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AdminModule { }