import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '@/app/layout/service/layout.service';
import { AuthService } from '@/app/services/auth.service';
import { environment } from '@/environments/environment';
import { Ripple } from 'primeng/ripple';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { AppSidebar } from '@/app/layout/components/app.sidebar';
import { AppBreadcrumb } from '@/app/layout/components/app.breadcrumb';

@Component({
    selector: '[app-topbar]',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, FormsModule, Ripple, ButtonModule, AppBreadcrumb, AppSidebar],
    template: `
        <div class="topbar-start">
            <button pButton pRipple #menubutton type="button" class="topbar-menubutton p-trigger" text rounded severity="secondary" (click)="onMenuButtonClick()">
                <i class="pi pi-bars"></i>
            </button>

            <div class="topbar-breadcrumb">
                <div app-breadcrumb></div>
            </div>
        </div>
        <div class="layout-topbar-menu-section">
            <div app-sidebar></div>
        </div>
        <div class="topbar-end">
            <ul class="topbar-menu">
                <li class="ml-4 mr-2">
                    <button pButton pRipple type="button" icon="pi pi-palette" class="shrink-0 config-button" text rounded (click)="onConfigButtonClick()"></button>
                </li>

                <li class="profile-item topbar-item mr-3">
                    <a pStyleClass="@next" enterFromClass="!hidden" enterActiveClass="animate-scalein" leaveToClass="!hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true" class="cursor-pointer">
                        <img class="rounded-full" [src]="avatarUrl()" />
                    </a>

                    <ul class="topbar-menu active-topbar-menu p-6! w-60 z-50 !hidden rounded shadow-xl">
                        <li role="menuitem" class="m-0! mb-4!">
                            <a
                                [routerLink]="['/cms/settings']"
                                class="flex items-center hover:text-primary-500 duration-200 cursor-pointer"
                                pStyleClass="@grandparent"
                                enterFromClass="!hidden"
                                enterActiveClass="animate-scalein"
                                leaveToClass="!hidden"
                                leaveActiveClass="animate-fadeout"
                                [hideOnOutsideClick]="true"
                            >
                                <i class="pi pi-fw pi-cog mr-2"></i>
                                <span>Settings</span>
                            </a>
                        </li>
                        <li role="menuitem" class="m-0!">
                            <a
                                (click)="logout()"
                                class="flex items-center hover:text-primary-500 duration-200 cursor-pointer"
                                pStyleClass="@grandparent"
                                enterFromClass="!hidden"
                                enterActiveClass="animate-scalein"
                                leaveToClass="!hidden"
                                leaveActiveClass="animate-fadeout"
                                [hideOnOutsideClick]="true"
                            >
                                <i class="pi pi-fw pi-sign-out mr-2"></i>
                                <span>Logout</span>
                            </a>
                        </li>
                    </ul>
                </li>

            </ul>
        </div>
    `,
    host: {
        class: 'layout-topbar'
    }
})
export class AppTopbar {
    menu: MenuItem[] = [];

    avatarUrl = computed(() => {
        const user = this.authService.user();
        if (!user?.avatar_url) return '/demo/images/avatar-m-1.jpg';
        return user.avatar_url.startsWith('http')
            ? user.avatar_url
            : `${environment.mediaBaseUrl}${user.avatar_url}`;
    });

    @ViewChild('searchinput') searchInput!: ElementRef<HTMLElement>;

    @ViewChild('menubutton') menuButton!: ElementRef<HTMLElement>;

    @ViewChild(AppSidebar) appSidebar!: AppSidebar;

    el = inject(ElementRef);

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService
    ) {}

    logout() {
        this.authService.logout();
    }

    searchBarActive = computed(() => this.layoutService.layoutState().searchBarActive);

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    activateSearch(el: HTMLElement | null = null) {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            searchBarActive: true
        }));
        setTimeout(() => {
            this.searchInput.nativeElement?.focus();
        }, 250);
    }

    deactivateSearch() {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            searchBarActive: false
        }));
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }

    onSidebarButtonClick() {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            rightMenuVisible: true
        }));
    }

    onProfileMenuButtonClick() {
        this.layoutService.layoutState.update((val) => ({
            ...val,
            rightMenuActive: true
        }));
    }
}
