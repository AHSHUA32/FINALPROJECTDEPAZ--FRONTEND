import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { SubNavComponent } from './subnav.component';
import { AccountsComponent } from './accounts/accounts.component';

import { AddEditComponent } from './accounts/add-edit.component';

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: OverviewComponent },
            { path: 'accounts', component: AccountsComponent },
            { path: 'accounts/add', component: AddEditComponent },
            { path: 'accounts/edit/:id', component: AddEditComponent }
        ]
    },
    { path: '', component: SubNavComponent, outlet: 'subnav' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }