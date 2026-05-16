import { Component } from '@angular/core';
import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({ selector: 'app-root', templateUrl: 'app.component.html', standalone: false })
export class AppComponent {
    Role = Role;
    account?: Account | null;
    sidebarOpen = false;

    constructor(private accountService: AccountService) {
        this.accountService.account.subscribe(x => this.account = x);
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
    }

    closeSidebar() {
        this.sidebarOpen = false;
    }

    logout() {
        this.closeSidebar();
        this.accountService.logout();
    }
}