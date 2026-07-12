import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { LayoutService } from '@/app/layout/service/layout.service';
import { Fluid } from 'primeng/fluid';
import { AppConfigurator } from '@/app/layout/components/app.configurator';
import { AuthService } from '@/app/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ToastModule, InputIcon, IconField, Fluid, AppConfigurator],
    providers: [MessageService],
    template: `
        <p-toast />
        <div [class]="'flex min-h-screen  ' + (layoutService.isDarkTheme() ? 'layout-dark' : 'layout-light')">
            <div class="w-6/12 h-screen hidden md:block shrink-0" style="max-width: 690px; background-image: url('/assets/images/cover.png'); background-repeat: no-repeat; background-size: cover; background-position: center;"></div>
            <div class="w-full" style="background: var(--surface-ground)">
                <p-fluid
                    class="min-h-screen text-center w-full flex items-center md:items-start justify-center flex-col bg-auto md:bg-contain bg-no-repeat!"
                    style="padding: 20% 10% 20% 10%; background: var(--exception-pages-image); background-size: contain;"
                >
                    <div class="flex flex-col">
                        <div class="flex flex-col items-center mb-8">
                            <img src="/assets/images/malikLogo.svg" style="width: 120px" alt="Malik Seed" />
                            <h1 class="text-2xl font-bold text-primary mt-4">Welcome to Malik Seed Admin</h1>
                        </div>
                        <div class="form-container">
                            <p-iconfield>
                                <p-inputicon class="pi pi-envelope" />
                                <input pInputText type="email" placeholder="Email" class="block mb-4" style="max-width: 320px; min-width: 270px" [(ngModel)]="email" />
                            </p-iconfield>

                            <p-iconfield>
                                <p-inputicon class="pi pi-key" />
                                <input pInputText type="password" placeholder="Password" class="block mb-4" style="max-width: 320px; min-width: 270px" [(ngModel)]="password" (keydown.enter)="onLogin()" />
                            </p-iconfield>
                            <a href="#" class="flex text-surface-500 dark:text-surface-400 mb-6 text-sm">Forgot your password?</a>
                        </div>
                        <div class="mt-6">
                            <button pButton pRipple type="button" class="block" style="max-width: 320px; margin-bottom: 32px" [loading]="loading" (click)="onLogin()">Login</button>
                            <span class="flex text-sm text-surface-500 dark:text-surface-400">Don’t have an account?<a class="cursor-pointer ml-1">Sign-up here</a></span>
                        </div>
                    </div>

                    <div class="flex items-center absolute" style="bottom: 75px">
                        <span class="text-sm text-surface-500 dark:text-surface-400 mr-2">Developed By</span>
                        <a href="https://syscomatic.com/" target="_blank" class="text-sm text-primary hover:underline">Syscomatic LLC</a>
                    </div>
                </p-fluid>
            </div>
        </div>
        <app-configurator [simple]="true" />`
})
export class Login {
    layoutService = inject(LayoutService);
    authService = inject(AuthService);
    messageService = inject(MessageService);
    router = inject(Router);

    email = '';
    password = '';
    loading = false;

    onLogin() {
        if (!this.email.trim() || !this.password) {
            this.messageService.add({ severity: 'warn', summary: 'Missing fields', detail: 'Please enter email and password' });
            return;
        }

        this.loading = true;
        this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/cms']);
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Login failed',
                    detail: err.error?.detail || 'Invalid email or password'
                });
            }
        });
    }
}
