import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, finalize } from 'rxjs/operators';
import { AccountService } from '@app/_services';

@Component({ templateUrl: 'forgot-password.component.html', standalone: false })
export class ForgotPasswordComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitted = false;
    resetLink = '';

    constructor(
        private formBuilder: FormBuilder,
        private accountService: AccountService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        if (this.form.invalid) { return; }

        this.loading = true;
        this.cdr.detectChanges();

        // grab the reset link directly from localStorage after fake backend sets it
        this.accountService.forgotPassword(this.f['email'].value)
            .pipe(
                first(),
                finalize(() => {
                    this.loading = false;

                    // get accounts from localStorage and find the reset token
                    const accounts = JSON.parse(localStorage.getItem('angular-15-signup-verification-boilerplate-accounts') || '[]');
                    const account = accounts.find((x: any) => x.email === this.f['email'].value);
                    if (account?.resetToken) {
                        this.resetLink = `${location.origin}/account/reset-password?token=${account.resetToken}`;
                    }
                    this.cdr.detectChanges();
                })
            )
            .subscribe();
    }
}